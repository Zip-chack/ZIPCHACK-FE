import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomePage.vue"),
  },
  {
    path: "/listings",
    name: "Listings",
    component: () => import("@/views/listings/ListingListPage.vue"),
  },
  {
    path: "/listings/create",
    name: "ListingCreate",
    component: () => import("@/views/listings/ListingCreatePage.vue"),
  },
  {
    path: "/listings/:id/edit",
    name: "ListingEdit",
    component: () => import("@/views/listings/ListingCreatePage.vue"),
  },
  {
    path: "/listings/:id",
    name: "ListingDetail",
    component: () => import("@/views/listings/ListingDetailPage.vue"),
  },
  {
    path: "/listings/:id/review",
    name: "ListingReview",
    component: () => import("@/views/reviews/ReviewCreatePage.vue"),
  },
  {
    path: "/buildings/:id",
    name: "BuildingDetail",
    component: () => import("@/views/buildings/BuildingDetailPage.vue"),
  },
  {
    path: "/buildings/:id/review",
    name: "BuildingReview",
    component: () => import("@/views/reviews/BuildingReviewCreatePage.vue"),
  },
  {
    path: "/chat/:roomId",
    name: "ChatRoom",
    component: () => import("@/views/chat/ChatRoomPage.vue"),
    props: true,
  },
  {
    path: "/map",
    name: "Map",
    component: () => import("@/views/map/MapPage.vue"),
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: () => import("@/views/listings/FavoriteListPage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginPage.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/auth/RegisterPage.vue"),
  },
  {
    path: "/find-username",
    name: "FindUsername",
    component: () => import("@/views/auth/FindUsernamePage.vue"),
  },
  {
    path: "/find-password",
    name: "FindPassword",
    component: () => import("@/views/auth/FindPasswordPage.vue"),
  },
  {
    path: "/my-chats",
    name: "MyChats",
    component: () => import("@/views/chat/MyChatsPage.vue"),
  },
  {
    path: "/my-page",
    name: "MyPage",
    component: () => import("@/views/user/MyPage.vue"),
  },
  {
    path: "/my-page/edit",
    name: "EditProfile",
    component: () => import("@/views/user/EditProfilePage.vue"),
  },
  {
    path: "/my-page/listings",
    name: "MyListings",
    component: () => import("@/views/user/MyListingsPage.vue"),
  },
  {
    path: "/my-page/reviews",
    name: "MyReviews",
    component: () => import("@/views/user/MyReviewsPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 브라우저 뒤로가기/앞으로가기 시 저장된 위치로 스크롤
    if (savedPosition) {
      return savedPosition;
    }
    // 그 외의 경우 항상 최상단으로 스크롤
    return { top: 0, behavior: "smooth" };
  },
});

export default router;
