# ZIP-Chack Vue Project

원룸 리뷰 플랫폼 - Vue 3 + Vite + Pinia + Tailwind CSS

## 프로젝트 구조

```
vue-project/
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
│   │   └── common/          # 공통 컴포넌트
│   │       ├── AppHeader.vue
│   │       ├── AppFooter.vue
│   │       ├── ListingCard.vue
│   │       ├── ReviewCard.vue
│   │       └── RatingInput.vue
│   ├── router/
│   │   └── index.js         # Vue Router 설정
│   ├── stores/              # Pinia 스토어
│   │   ├── auth.js
│   │   ├── listing.js
│   │   └── building.js
│   └── views/               # 페이지 컴포넌트
│       ├── HomePage.vue
│       ├── ListingListPage.vue
│       ├── ListingDetailPage.vue
│       ├── ListingCreatePage.vue
│       ├── ReviewCreatePage.vue
│       ├── BuildingReviewCreatePage.vue
│       ├── MapPage.vue
│       ├── FavoriteListPage.vue
│       ├── LoginPage.vue
│       └── RegisterPage.vue
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

- 매물 목록/상세/등록
- 건물/매물 리뷰 작성
- 지도 기반 검색 (카카오맵 API 연동 필요)
- 찜 목록 관리
- 로그인/회원가입

## 환경 변수

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_KAKAO_MAP_KEY=your_kakao_map_key
```
