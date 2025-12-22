# ZIP-Chack Vue Project

원룸 리뷰 플랫폼 - Vue 3 + Vite + Pinia + Tailwind CSS

## 프로젝트 구조

```
zipchack-fe/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.js              # 앱 진입점
│   ├── App.vue              # 루트 컴포넌트
│   ├── assets/
│   │   └── css/
│   │       └── main.css     # 전역 스타일
│   ├── components/
│   │   ├── common/          # 공통 컴포넌트 (Header, Footer, Cards)
│   │   ├── map/             # 지도 관련 컴포넌트 (Sidebar, Overlays)
│   │   ├── chat/            # 채팅 관련 컴포넌트
│   │   └── ...
│   ├── config/              # API 설정 (Endpoints)
│   ├── router/
│   │   └── index.js         # Vue Router 설정
│   ├── stores/              # Pinia 스토어
│   │   ├── auth.js          # 인증 상태
│   │   ├── listing.js       # 매물 관리
│   │   ├── building.js      # 건물/지도 데이터
│   │   └── chat.js          # 실시간 채팅 (WebSocket)
│   ├── utils/
│   │   └── api.js           # Axios 인터셉터 및 API 모듈
│   └── views/               # 페이지 컴포넌트
│       ├── auth/            # 로그인, 회원가입, ID/PW 찾기
|       ├── buildings/       # 건물 상세, 리뷰 작성
│       ├── listings/        # 매물 목록, 상세, 등록
│       ├── map/             # 지도 메인 페이지 (MapPage)
│       ├── chat/            # 채팅방, 채팅 목록
│       ├── reviews/         # 리뷰
│       └── user/            # 마이페이지, 내 활동 내역
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 기능

- **매물 관리**: 매물 목록/상세 조회, 매물 등록(이미지 업로드), 찜하기
- **지도 서비스**: 
  - 카카오맵 기반 매물/건물 위치 시각화
  - 지도 영역(Bounds) 내 검색 및 클러스터링
  - 주소 및 키워드 검색
- **데이터 분석**:
  - **공공데이터 연동**: 국토교통부 아파트 전월세 실거래가 조회 및 지도 표시
  - **AI 상권 분석**: Python 서버 연동을 통한 주변 상권 리포트 및 레이더 차트 제공
- **실시간 소통**:
  - **1:1 채팅**: WebSocket(STOMP)을 이용한 실시간 메시지 전송
  - **상태 동기화**: 채팅방 내 거래 완료 시 매물 상태 자동 업데이트
- **리뷰 커뮤니티**: 건물 및 매물 리뷰 작성, 별점 평가 시스템
- **회원 서비스**: JWT 로그인, 이메일 인증, 마이페이지(내 리뷰/매물 관리)

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정해야 합니다.

```env
# 백엔드 API 주소 (Spring Boot)
VITE_API_BASE_URL=http://localhost:8080/api

# 웹소켓 주소
VITE_WEBSOCKET_URL=http://localhost:8080/ws/chat

# 카카오맵 JavaScript 키
VITE_KAKAO_MAP_JS_KEY=your_kakao_map_javascript_key
```
