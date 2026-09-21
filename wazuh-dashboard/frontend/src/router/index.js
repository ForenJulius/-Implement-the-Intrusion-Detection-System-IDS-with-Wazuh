import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import AlertsView from '../views/AlertsView.vue'
import AgentsView from '../views/AgentsView.vue'
import RulesView from '../views/RulesView.vue'
import UsersView from '../views/UsersView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import HomeView from '../views/HomeView.vue'


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/forgot-password', component: ForgotPasswordView },
  
  { path: '/dashboard', component: DashboardView },
  { path: '/alerts', component: AlertsView },
  { path: '/profile', component: ProfileView },

  // Admin routes
  { path: '/admin/overview', component: DashboardView },
  { path: '/admin/agents', component: AgentsView },
  { path: '/admin/rules', component: RulesView },
  { path: '/admin/users', component: UsersView },
  
  { path: '/', redirect: '/dashboard' },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router