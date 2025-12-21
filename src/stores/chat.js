import { defineStore } from "pinia";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "@/utils/api";
import { useAuthStore } from "./auth";

// [신규] 메시지 객체를 표준 형식으로 변환하는 정규화 함수
function normalizeMessage(rawMsg, currentUserId) {
  if (!rawMsg) return null;
  // 타입 안전성을 위해 명시적으로 Number로 변환
  const senderId = rawMsg.senderId != null ? Number(rawMsg.senderId) : null;
  const userId = currentUserId != null ? Number(currentUserId) : null;

  if (senderId === null) return null;

  const isMine = userId !== null && senderId === userId;

  return {
    id: rawMsg.messageId || rawMsg.id,
    senderId: senderId,
    content: rawMsg.content,
    createdAt: new Date(rawMsg.createdAt), // 항상 Date 객체로 변환
    isMine: isMine, // UI에서 사용할 '내 메시지 여부' 플래그
    clientMessageId: rawMsg.clientMessageId || null,
  };
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    stompClient: null,
    isConnected: false,
    currentRoomId: null,
    currentRoomStatus: null,
    messages: [],
    targetUserId: null,
    targetUserNickname: null,
    amIOwner: false, // Is the current user the owner of the listing?
    currentSubscription: null, // 현재 활성화된 구독 추적
    connectedUserId: null, // 현재 연결된 사용자 ID 추적
    connectedToken: null, // 현재 연결에 사용된 토큰 추적
  }),
  actions: {
    connect(roomId) {
      const authStore = useAuthStore();
      const token = authStore.token;
      const currentUser = authStore.user;
      const currentUserId = currentUser?.id;

      // 토큰이나 사용자 정보가 없으면 연결하지 않음
      if (!token || !currentUser || !currentUserId) {
        console.error("WebSocket 연결을 위한 인증 정보가 없습니다.");
        // 기존 연결이 있으면 정리
        if (this.stompClient && this.stompClient.active) {
          this.disconnect();
        }
        return;
      }

      // 사용자 또는 토큰이 변경된 경우 기존 연결을 완전히 정리하고 재연결
      if (
        this.stompClient &&
        this.stompClient.active &&
        (this.connectedUserId !== currentUserId ||
          this.connectedToken !== token)
      ) {
        console.log("사용자 또는 토큰이 변경되어 기존 연결을 정리합니다.", {
          oldUserId: this.connectedUserId,
          newUserId: currentUserId,
          oldToken: this.connectedToken ? "***" : null,
          newToken: token ? "***" : null,
        });
        this.disconnect();
      }

      // 이미 연결되어 있고 같은 사용자, 같은 토큰이라면
      if (
        this.stompClient &&
        this.stompClient.active &&
        this.connectedUserId === currentUserId &&
        this.connectedToken === token
      ) {
        // 같은 방이고 구독이 없으면 구독만 추가
        if (this.currentRoomId === roomId && !this.currentSubscription) {
          this.subscribeToRoom(roomId);
        }
        return;
      }
      this.stompClient = new Client({
        webSocketFactory: () =>
          new SockJS(
            import.meta.env.VITE_WEBSOCKET_URL ||
              "http://localhost:8080/ws/chat"
          ),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          this.isConnected = true;
          // 연결된 사용자 ID와 토큰 저장
          const authStore = useAuthStore();
          this.connectedUserId = authStore.user?.id;
          this.connectedToken = authStore.token;
          if (this.currentRoomId) {
            this.subscribeToRoom(this.currentRoomId);
          }
        },
        onStompError: (frame) => {
          console.error("STOMP 에러:", frame.headers["message"]);
          this.isConnected = false;
        },
        onDisconnect: () => {
          this.isConnected = false;
          // 연결이 끊어지면 구독도 정리
          this.currentSubscription = null;
        },
      });
      this.stompClient.activate();
    },

    subscribeToRoom(roomId) {
      if (!this.stompClient || !this.stompClient.connected) return;

      const authStore = useAuthStore();
      const currentUser = authStore.user;
      const currentUserId = currentUser?.id;

      // 사용자 정보가 없으면 구독하지 않음
      if (!currentUser || !currentUserId) {
        console.warn("사용자 정보가 없어 구독할 수 없습니다.");
        return;
      }

      // 이전 구독이 있으면 취소
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
        this.currentSubscription = null;
      }

      const destination = `/queue/chat/${roomId}/user/${currentUserId}`;
      this.currentSubscription = this.stompClient.subscribe(
        destination,
        (message) => {
          const rawMessage = JSON.parse(message.body);
          const normalized = normalizeMessage(rawMessage, currentUserId);

          if (!normalized) return;

          // 현재 방의 메시지만 처리 (방 전환 시 발생할 수 있는 지연된 메시지 방지)
          if (this.currentRoomId !== roomId) {
            return;
          }

          if (normalized.clientMessageId && normalized.isMine) {
            const index = this.messages.findIndex(
              (m) => m.clientMessageId === normalized.clientMessageId
            );
            if (index !== -1) {
              this.messages.splice(index, 1, normalized);
            } else {
              this.messages.push(normalized);
            }
          } else {
            this.messages.push(normalized);
          }
        }
      );
    },

    async _enterChatRoom(roomId) {
      const authStore = useAuthStore();
      const currentUser = await authStore.init();

      if (!currentUser || !currentUser.id) {
        throw new Error(
          "로그인 정보가 유효하지 않습니다. 페이지를 새로고침 해주세요."
        );
      }
      const currentUserId = currentUser.id;

      // 이전 방의 구독 정리
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
        this.currentSubscription = null;
      }

      // 메시지 초기화 (방 전환 시 이전 메시지 제거)
      this.messages = [];

      const roomDetailsResponse = await api.get(`/chat/rooms/${roomId}`);
      const data = roomDetailsResponse.data;

      this.currentRoomId = data.roomId;
      this.currentRoomStatus = data.status;
      this.targetUserId = data.targetUserId;
      this.targetUserNickname = data.targetUserNickname;
      this.amIOwner = data.amIOwner; // Set the new flag

      const historyResponse = await api.get(`/chat/rooms/${roomId}/messages`);
      this.messages = historyResponse.data.map((msg) =>
        normalizeMessage(msg, currentUserId)
      );

      this.connect(roomId);
      return this.currentRoomId;
    },

    async enterRoom(listingId) {
      try {
        const { data } = await api.post("/chat/rooms", { listingId });
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
        alert(
          error.response?.data?.message || "ID로 채팅방 입장에 실패했습니다."
        );
        return null;
      }
    },

    sendMessage(content) {
      const authStore = useAuthStore();
      const currentUser = authStore.user;
      const currentUserId = currentUser?.id;

      // 사용자 정보와 토큰 확인
      if (!currentUser || !currentUserId || !authStore.token) {
        alert("사용자 정보가 유효하지 않아 메시지를 보낼 수 없습니다.");
        return;
      }
      if (!this.stompClient || !this.stompClient.connected) {
        alert("채팅 서버에 연결되지 않았습니다.");
        return;
      }
      if (this.currentRoomStatus === "COMPLETED") {
        alert("이미 종료된 채팅방입니다.");
        return;
      }

      const clientMessageId = `temp_${Date.now()}`;

      const optimisticMessage = normalizeMessage(
        {
          messageId: null,
          senderId: currentUserId,
          content: content,
          createdAt: new Date().toISOString(),
          clientMessageId: clientMessageId,
        },
        currentUserId
      );

      this.messages.push(optimisticMessage);

      const payload = { content, clientMessageId };
      this.stompClient.publish({
        destination: `/pub/chat/send/${this.currentRoomId}`,
        body: JSON.stringify(payload),
      });
    },

    disconnect() {
      // 구독 먼저 취소
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
        this.currentSubscription = null;
      }
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
      this.connectedUserId = null; // 연결된 사용자 ID 초기화
      this.connectedToken = null; // 연결된 토큰 초기화
    },

    // 로그인 시 완전히 리셋하는 메서드
    reset() {
      this.disconnect();
      // 모든 상태를 초기값으로 리셋
      this.stompClient = null;
      this.isConnected = false;
      this.currentRoomId = null;
      this.currentRoomStatus = null;
      this.messages = [];
      this.targetUserId = null;
      this.targetUserNickname = null;
      this.amIOwner = false;
      this.currentSubscription = null;
      this.connectedUserId = null;
      this.connectedToken = null;
    },

    async completeChat() {
      if (!this.currentRoomId) return;
      try {
        await api.patch(`/chat/rooms/${this.currentRoomId}/complete`);
        this.currentRoomStatus = 'COMPLETED';
      } catch (error) {
        console.error("채팅 완료 처리에 실패했습니다:", error);
      }
    },
  },
});
