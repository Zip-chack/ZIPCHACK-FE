import { defineStore } from 'pinia';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '@/utils/api'; // Assuming this is your API client
import { useAuthStore } from './auth'; // Assuming you have an auth store

export const useChatStore = defineStore('chat', {
    state: () => ({
        stompClient: null,
        isConnected: false,
        currentRoomId: null,
        currentRoomStatus: null,
        messages: [],
        targetUserId: null, // Renamed from opponentId
        targetUserNickname: null, // Renamed from opponentNickname
    }),
    actions: {
        async connect() {
            if (this.isConnected) return;
            const authStore = useAuthStore();
            
            // Ensure authStore is initialized to get user and token
            if (!authStore.user) {
                await authStore.init(); // This will fetch user info and token if available
            }
            const token = authStore.token;

            if (!token) {
                console.error("No auth token found for WebSocket connection. User might not be logged in.");
                // Potentially redirect to login or show error
                return;
            }

            const socket = new SockJS(import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8080/ws/chat'); // Backend address
            this.stompClient = Stomp.over(socket);

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            this.stompClient.connect(
                headers,
                () => { // onConnect
                    this.isConnected = true;
                    console.log('WebSocket connected');
                    if(this.currentRoomId) {
                        this.subscribeToRoom(this.currentRoomId);
                    }
                },
                (error) => { // onError
                    console.error('WebSocket connection error:', error);
                    this.isConnected = false;
                    // Handle connection error, e.g., display a message
                }
            );
        },

        subscribeToRoom(roomId) {
            if (!this.isConnected || !this.stompClient) return;
            const authStore = useAuthStore();
            
            if (!authStore.user?.id) {
                console.error("User ID not available for WebSocket subscription.");
                return;
            }
            const userId = authStore.user.id;

            const destination = `/queue/chat/${roomId}/user/${userId}`;

            this.stompClient.subscribe(destination, (message) => {
                const receivedMessage = JSON.parse(message.body);

                // Ensure createdAt is a Date object for consistent handling in the UI
                if (receivedMessage.createdAt) {
                    receivedMessage.createdAt = new Date(receivedMessage.createdAt);
                }

                // If the message has a clientMessageId and was sent by the current user,
                // it's a confirmation of an optimistic message.
                if (receivedMessage.clientMessageId && receivedMessage.senderId === userId) {
                    const index = this.messages.findIndex(
                        (msg) => msg.clientMessageId === receivedMessage.clientMessageId
                    );
                    
                    if (index !== -1) {
                        // Replace the temporary message with the confirmed one from the server
                        this.messages.splice(index, 1, receivedMessage);
                    } else {
                        // This case is unlikely but as a fallback, we add it if not found
                        this.messages.push(receivedMessage);
                    }
                } else {
                    // It's a message from the opponent or a system message without a client ID
                    this.messages.push(receivedMessage);
                    if(receivedMessage.senderId === 0) { // System message for completion
                        this.currentRoomStatus = 'COMPLETED';
                    }
                }
            });
            console.log(`Subscribed to ${destination}`);
        },

        async enterRoom(listingId) {
            try {
                // Ensure authStore is initialized to get user and token
                const authStore = useAuthStore();
                if (!authStore.user) {
                    await authStore.init(); // This will fetch user info and token if available
                }
                if (!authStore.isLoggedIn) {
                    alert("로그인이 필요합니다."); // Or redirect to login page
                    return null;
                }

                const { data } = await api.post('/chat/rooms', { listingId });
                this.currentRoomId = data.roomId;
                this.currentRoomStatus = data.status;
                this.targetUserId = data.targetUserId; // Updated field name
                this.targetUserNickname = data.targetUserNickname; // Updated field name

                const historyResponse = await api.get(`/chat/rooms/${this.currentRoomId}/messages`);
                this.messages = historyResponse.data;

                if (!this.isConnected) {
                    await this.connect();
                } else {
                    this.subscribeToRoom(this.currentRoomId);
                }

                return this.currentRoomId;
            } catch (error) {
                console.error("Failed to enter chat room:", error);
                alert(error.response?.data?.message || "채팅방 입장에 실패했습니다.");
                return null;
            }
        },

        async joinRoomById(roomId) {
            try {
                const roomDetailsResponse = await api.get(`/chat/rooms/${roomId}`);
                this.currentRoomId = roomDetailsResponse.data.roomId;
                this.currentRoomStatus = roomDetailsResponse.data.status;
                this.targetUserId = roomDetailsResponse.data.targetUserId; // Updated field name
                this.targetUserNickname = roomDetailsResponse.data.targetUserNickname; // Updated field name

                const historyResponse = await api.get(`/chat/rooms/${this.currentRoomId}/messages`);
                this.messages = historyResponse.data;

                if (!this.isConnected) {
                    await this.connect();
                } else {
                    this.subscribeToRoom(this.currentRoomId);
                }

                return this.currentRoomId;
            } catch (error) {
                console.error("Failed to join chat room by ID:", error);
                alert(error.response?.data?.message || "채팅방 입장에 실패했습니다.");
                return null;
            }
        },
        
        async completeChat() {
            if (!this.currentRoomId) return;
            try {
                await api.patch(`/chat/rooms/${this.currentRoomId}/complete`);
                console.log('Chat marked as completed.');
                // The system message received via WebSocket will update the status
            } catch (error) {
                console.error('Failed to complete chat:', error);
            }
        },

        sendMessage(content) {
            if (this.currentRoomStatus === 'COMPLETED') {
                alert('이미 종료된 채팅방입니다.');
                return;
            }
            if (!this.isConnected || !this.stompClient || !this.currentRoomId) return;

            const authStore = useAuthStore();
            const clientMessageId = `temp_${Date.now()}`;

            // Create a message object for optimistic update
            const optimisticMessage = { 
                clientMessageId,
                messageId: null, // No real ID yet
                content,
                senderId: authStore.user?.id,
                createdAt: new Date(), // Use a real Date object to prevent "Invalid Date"
            };

            // Optimistic update: add message to local state immediately
            this.messages.push(optimisticMessage);

            // The payload sent to the server
            const payload = { 
                content,
                clientMessageId 
            };

            this.stompClient.publish({
                destination: `/pub/chat/send/${this.currentRoomId}`,
                body: JSON.stringify(payload),
            });
        },

        disconnect() {
            if (this.stompClient) {
                this.stompClient.disconnect(() => {
                    this.isConnected = false;
                    this.messages = [];
                    this.currentRoomId = null;
                    this.currentRoomStatus = null;
                    this.targetUserId = null; // Updated field name
                    this.targetUserNickname = null; // Updated field name
                    console.log('WebSocket disconnected');
                });
            }
        },
    },
});
