import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomePage.vue"),
  },
  {
    path: "/listings",
    name: "Listings",
    component: () => import("@/views/ListingListPage.vue"),
  },
  {
    path: "/listings/create",
    name: "ListingCreate",
    component: () => import("@/views/ListingCreatePage.vue"),
  },
  {
    path: "/listings/:id",
    name: "ListingDetail",
    component: () => import("@/views/ListingDetailPage.vue"),
  },
  {
    path: "/listings/:id/review",
    name: "ListingReview",
    component: () => import("@/views/ReviewCreatePage.vue"),
  },
  {
    path: "/buildings/:id/review",
    name: "BuildingReview",
    component: () => import("@/views/BuildingReviewCreatePage.vue"),
  },
  {
    path: "/map",
    name: "Map",
    component: () => import("@/views/MapPage.vue"),
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: () => import("@/views/FavoriteListPage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/RegisterPage.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
