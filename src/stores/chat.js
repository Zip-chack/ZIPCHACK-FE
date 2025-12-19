import { defineStore } from 'pinia';
import { Client } from '@stomp/stompjs'; // Stomp 대신 Client 임포트
import SockJS from 'sockjs-client';
import api from '@/utils/api';
import { useAuthStore } from './auth';

export const useChatStore = defineStore('chat', {
    state: () => ({
        stompClient: null,
        isConnected: false,
        currentRoomId: null,
        currentRoomStatus: null,
        messages: [],
        targetUserId: null,
        targetUserNickname: null,
    }),
    actions: {
        // WebSocket 연결을 설정하고 활성화합니다.
        // 연결할 roomId를 인자로 받도록 수정
        connect(roomId) {
            if (this.isConnected && this.stompClient && this.stompClient.connected) {
                console.log('이미 연결되어 있습니다.');
                // 이미 연결되어 있다면, 해당 roomId를 구독하도록만 처리
                if(this.currentRoomId === roomId) {
                    this.subscribeToRoom(roomId);
                }
                return;
            }
            if (this.stompClient && this.stompClient.active) {
                console.log('이미 연결 시도 중입니다.');
                return;
            }

            const authStore = useAuthStore();
            const token = authStore.token;
            if (!token) {
                console.error("WebSocket 연결을 위한 인증 토큰이 없습니다.");
                return;
            }

            // 1. Stomp Client 인스턴스 생성
            this.stompClient = new Client({
                // SockJS 사용 시 webSocketFactory 제공
                webSocketFactory: () => {
                    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8080/ws/chat';
                    console.log(`Attempting to connect to WebSocket via SockJS at: ${wsUrl}`);
                    return new SockJS(wsUrl);
                },

                // 헤더 설정 (인증 토큰 포함)
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                
                // 디버그 메시지 (개발 중에만 유용)
                debug: (str) => {
                    // console.log(new Date(), str);
                },

                // 자동 재연결 설정 (5초 딜레이)
                reconnectDelay: 5000,
                
                // 연결 성공 시 콜백
                onConnect: (frame) => {
                    this.isConnected = true;
                    console.log('WebSocket 연결 성공:', frame);
                    // 연결 성공 후 현재 방을 구독
                    if(this.currentRoomId) {
                        this.subscribeToRoom(this.currentRoomId);
                    }
                },

                // 연결 에러 시 콜백
                onStompError: (frame) => {
                    console.error('STOMP 에러:', frame.headers['message'], frame.body);
                    this.isConnected = false;
                    // 에러 발생 시 disconnect 호출 (재연결은 reconnectDelay가 알아서 처리)
                    // this.disconnect(); // Client는 reconnectDelay가 있으므로 명시적 disconnect는 필요 없을 수 있음.
                },

                // 웹소켓 연결 종료 시
                onDisconnect: () => {
                    this.isConnected = false;
                    console.log('WebSocket 연결 해제됨');
                }
            });

            // 2. 클라이언트 활성화 (연결 시작)
            this.stompClient.activate();
        },

        // 특정 채팅방 구독
        subscribeToRoom(roomId) {
            if (!this.stompClient || !this.stompClient.connected) {
                console.warn('STOMP 클라이언트가 연결되지 않아 구독할 수 없습니다.');
                return;
            }
            const authStore = useAuthStore();
            const userId = authStore.user?.id;

            if (!userId) {
                console.error("User ID not available for WebSocket subscription.");
                return;
            }

            const destination = `/queue/chat/${roomId}/user/${userId}`;
            // 이미 구독되어 있는지 확인 (Client는 자동으로 중복 구독 방지)
            // if (this.stompClient.subscriptions[destination]) return; // Client 내부에서 관리되므로 불필요

            this.stompClient.subscribe(destination, (message) => {
                const receivedMessage = JSON.parse(message.body);

                // createdAt을 Date 객체로 변환
                if (receivedMessage.createdAt) {
                    receivedMessage.createdAt = new Date(receivedMessage.createdAt);
                }

                // 메시지 중복 방지 및 스타일링 로직 (기존 코드 유지)
                if (receivedMessage.clientMessageId && receivedMessage.senderId === userId) {
                    const index = this.messages.findIndex(
                        (msg) => msg.clientMessageId === receivedMessage.clientMessageId
                    );
                    
                    if (index !== -1) {
                        this.messages.splice(index, 1, receivedMessage);
                    } else {
                        this.messages.push(receivedMessage);
                    }
                } else {
                    this.messages.push(receivedMessage);
                    if(receivedMessage.senderId === 0) {
                        this.currentRoomStatus = 'COMPLETED';
                    }
                }
            });
            console.log(`구독 시작: ${destination}`);
        },

        // 채팅방 입장/생성 (기존 로직 유지, connect 호출 방식만 변경)
        async enterRoom(listingId) {
            try {
                const authStore = useAuthStore();
                if (!authStore.user) {
                    await authStore.init();
                }
                if (!authStore.isLoggedIn) {
                    alert("로그인이 필요합니다.");
                    return null;
                }

                const { data } = await api.post('/chat/rooms', { listingId });
                this.currentRoomId = data.roomId;
                this.currentRoomStatus = data.status;
                this.targetUserId = data.targetUserId;
                this.targetUserNickname = data.targetUserNickname;

                const historyResponse = await api.get(`/chat/rooms/${this.currentRoomId}/messages`);
                this.messages = historyResponse.data;

                // 새로운 connect 호출 방식
                this.connect(this.currentRoomId);

                return this.currentRoomId;
            } catch (error) {
                console.error("채팅방 입장에 실패했습니다:", error);
                alert(error.response?.data?.message || "채팅방 입장에 실패했습니다.");
                return null;
            }
        },

        // ID로 채팅방 입장 (기존 로직 유지, connect 호출 방식만 변경)
        async joinRoomById(roomId) {
            try {
                const roomDetailsResponse = await api.get(`/chat/rooms/${roomId}`);
                const data = roomDetailsResponse.data;
                
                this.currentRoomId = data.roomId;
                this.currentRoomStatus = data.status;
                this.targetUserId = data.targetUserId;
                this.targetUserNickname = data.targetUserNickname;

                const historyResponse = await api.get(`/chat/rooms/${this.currentRoomId}/messages`);
                this.messages = historyResponse.data;

                // 새로운 connect 호출 방식
                this.connect(this.currentRoomId);

                return this.currentRoomId;
            } catch (error) {
                console.error("ID로 채팅방 입장에 실패했습니다:", error);
                alert(error.response?.data?.message || "채팅방 입장에 실패했습니다.");
                return null;
            }
        },
        
        async completeChat() {
            if (!this.currentRoomId) return;
            try {
                await api.patch(`/chat/rooms/${this.currentRoomId}/complete`);
                console.log('채팅이 완료 상태로 변경되었습니다.');
            } catch (error) {
                console.error('채팅 완료 처리에 실패했습니다:', error);
            }
        },

        sendMessage(content) {
            if (this.currentRoomStatus === 'COMPLETED') {
                alert('이미 종료된 채팅방입니다.');
                return;
            }
            if (!this.stompClient || !this.stompClient.connected || !this.currentRoomId) {
                console.warn('STOMP 클라이언트가 연결되지 않아 메시지를 보낼 수 없습니다.');
                return;
            }

            const authStore = useAuthStore();
            const clientMessageId = `temp_${Date.now()}`;

            const optimisticMessage = { 
                clientMessageId,
                messageId: null,
                content,
                senderId: authStore.user?.id,
                createdAt: new Date(),
            };

            this.messages.push(optimisticMessage);

            const payload = { 
                content,
                clientMessageId 
            };

            this.stompClient.publish({
                destination: `/pub/chat/send/${this.currentRoomId}`,
                body: JSON.stringify(payload),
            });
        },

        // 연결 해제
        disconnect() {
            if (this.stompClient && this.stompClient.active) { // stompClient.active로 연결 상태 확인
                this.stompClient.deactivate(); // deactivate() 호출로 안전하게 종료
            }
            this.stompClient = null;
            this.isConnected = false;
            this.messages = [];
            this.currentRoomId = null;
            this.currentRoomStatus = null;
            this.targetUserId = null;
            this.targetUserNickname = null;
            console.log('WebSocket 연결 및 상태 초기화 완료.');
        },
    },
});
