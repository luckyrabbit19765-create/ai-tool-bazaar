import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import CatalogView from "../views/CatalogView.vue"
import CartView from "../views/CartView.vue"
import MessagesView from "../views/MessagesView.vue"
import DetailView from "../views/DetailView.vue"
import NotFoundView from "../views/NotFoundView.vue"
import PublishView from "../views/PublishView.vue"
import ProfileView from "../views/ProfileView.vue"
import AuthView from "../views/AuthView.vue"
import AdminView from "../views/AdminView.vue"
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
    component: CatalogView
  },
  {
    path: "/cart",
    name: "cart",
    component: CartView
  },
  {
    path: "/messages",
    name: "messages",
    component: MessagesView,
    meta: { requiresAuth: true }
  },
  {
    path: "/tool/:id",
    name: "tool-detail",
    component: DetailView
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthView
  },
  {
    path: "/publish",
    name: "publish",
    component: PublishView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 90,
        behavior: "smooth"
      }
    }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  const currentUser = readCurrentUser()

  if (!currentUser) {
    return {
      path: "/auth",
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.meta.requiresAdmin && currentUser.role !== "admin") {
    return {
      path: "/profile"
    }
  }

  return true
})

export default router
