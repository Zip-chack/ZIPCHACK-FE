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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
