import { defineStore } from 'pinia';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '@/utils/api';
import { useAuthStore } from './auth';

// [신규] 메시지 객체를 표준 형식으로 변환하는 정규화 함수
function normalizeMessage(rawMsg, currentUserId) {
    if (!rawMsg) return null;
    const senderId = Number(rawMsg.senderId);
    const isMine = senderId === Number(currentUserId);
    
    return {
        id: rawMsg.messageId,
        senderId: senderId,
        content: rawMsg.content,
        createdAt: new Date(rawMsg.createdAt), // 항상 Date 객체로 변환
        isMine: isMine, // UI에서 사용할 '내 메시지 여부' 플래그
        clientMessageId: rawMsg.clientMessageId || null,
    };
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        stompClient: null,
        isConnected: false,
        currentRoomId: null,
        currentRoomStatus: null,
        messages: [],
        targetUserId: null,
        targetUserNickname: null,
        amIOwner: false, // Is the current user the owner of the listing?
    }),
    actions: {
        connect(roomId) {
            if (this.stompClient && this.stompClient.active) {
                return;
            }
            const authStore = useAuthStore();
            const token = authStore.token;
            if (!token) {
                console.error("WebSocket 연결을 위한 인증 토큰이 없습니다.");
                return;
            }
            this.stompClient = new Client({
                webSocketFactory: () => new SockJS(import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8080/ws/chat'),
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                onConnect: () => {
                    this.isConnected = true;
                    if(this.currentRoomId) this.subscribeToRoom(this.currentRoomId);
                },
                onStompError: (frame) => {
                    console.error('STOMP 에러:', frame.headers['message']);
                    this.isConnected = false;
                },
                onDisconnect: () => {
                    this.isConnected = false;
                }
            });
            this.stompClient.activate();
        },

        subscribeToRoom(roomId) {
            if (!this.stompClient || !this.stompClient.connected) return;
            
            const authStore = useAuthStore();
            const currentUserId = authStore.user?.id;
            if (!currentUserId) return;

            const destination = `/queue/chat/${roomId}/user/${currentUserId}`;
            this.stompClient.subscribe(destination, (message) => {
                const rawMessage = JSON.parse(message.body);
                const normalized = normalizeMessage(rawMessage, currentUserId);

                if (!normalized) return;

                if (normalized.clientMessageId && normalized.isMine) {
                    const index = this.messages.findIndex(m => m.clientMessageId === normalized.clientMessageId);
                    if (index !== -1) {
                        this.messages.splice(index, 1, normalized);
                    } else {
                        this.messages.push(normalized);
                    }
                } else {
                    this.messages.push(normalized);
                }
            });
        },

        async _enterChatRoom(roomId) {
            const authStore = useAuthStore();
            const currentUser = await authStore.init(); 
            
            if (!currentUser || !currentUser.id) {
                throw new Error("로그인 정보가 유효하지 않습니다. 페이지를 새로고침 해주세요.");
            }
            const currentUserId = currentUser.id;

            const roomDetailsResponse = await api.get(`/chat/rooms/${roomId}`);
            const data = roomDetailsResponse.data;

            this.currentRoomId = data.roomId;
            this.currentRoomStatus = data.status;
            this.targetUserId = data.targetUserId;
            this.targetUserNickname = data.targetUserNickname;
            this.amIOwner = data.amIOwner; // Set the new flag

            const historyResponse = await api.get(`/chat/rooms/${roomId}/messages`);
            this.messages = historyResponse.data.map(msg => normalizeMessage(msg, currentUserId));

            this.connect(roomId);
            return this.currentRoomId;
        },

        async enterRoom(listingId) {
            try {
                const { data } = await api.post('/chat/rooms', { listingId });
                return await this._enterChatRoom(data.roomId);
            } catch (error) {
                console.error("채팅방 입장에 실패했습니다:", error);
                alert(error.response?.data?.message || "채팅방 입장에 실패했습니다.");
                return null;
            }
        },

        async joinRoomById(roomId) {
            try {
                return await this._enterChatRoom(roomId);
            } catch (error) {
                console.error("ID로 채팅방 입장에 실패했습니다:", error);
                alert(error.response?.data?.message || "ID로 채팅방 입장에 실패했습니다.");
                return null;
            }
        },
        
        sendMessage(content) {
            const authStore = useAuthStore();
            const currentUserId = authStore.user?.id;
            if (!currentUserId) {
                alert('사용자 정보가 유효하지 않아 메시지를 보낼 수 없습니다.');
                return;
            }
            if (!this.stompClient || !this.stompClient.connected) {
                 alert('채팅 서버에 연결되지 않았습니다.');
                 return;
            }
             if (this.currentRoomStatus === 'COMPLETED') {
                alert('이미 종료된 채팅방입니다.');
                return;
            }

            const clientMessageId = `temp_${Date.now()}`;
            
            const optimisticMessage = normalizeMessage({
                messageId: null,
                senderId: currentUserId,
                content: content,
                createdAt: new Date().toISOString(),
                clientMessageId: clientMessageId,
            }, currentUserId);

            this.messages.push(optimisticMessage);

            const payload = { content, clientMessageId };
            this.stompClient.publish({
                destination: `/pub/chat/send/${this.currentRoomId}`,
                body: JSON.stringify(payload),
            });
        },

        disconnect() {
            if (this.stompClient && this.stompClient.active) {
                this.stompClient.deactivate();
            }
            this.stompClient = null;
            this.isConnected = false;
            this.messages = [];
            this.currentRoomId = null;
            this.currentRoomStatus = null;
            this.targetUserId = null;
            this.targetUserNickname = null;
            this.amIOwner = false; // Reset the flag
        },
        
        async completeChat() {
            if (!this.currentRoomId) return;
            try {
                await api.patch(`/chat/rooms/${this.currentRoomId}/complete`);
            } catch (error) {
                console.error('채팅 완료 처리에 실패했습니다:', error);
            }
        },
    },
});