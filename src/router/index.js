import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import { readCurrentUser } from "../composables/useUserSession"

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/catalog",
    name: "catalog",
    component: () => import("../views/CatalogView.vue")
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("../views/CartView.vue")
  },
  {
    path: "/messages",
    name: "messages",
    component: () => import("../views/MessagesView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/tool/:id",
    name: "tool-detail",
    component: () => import("../views/DetailView.vue")
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("../views/AuthView.vue")
  },
  {
    path: "/publish",
    name: "publish",
    component: () => import("../views/PublishView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/AdminView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFoundView.vue")
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, top: 90, behavior: "smooth" }
    }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const currentUser = readCurrentUser()
  if (!currentUser) {
    return { path: "/auth", query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && currentUser.role !== "admin") {
    return { path: "/profile" }
  }

  return true
})

export default router
