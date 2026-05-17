import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'

const backendRoutes = [
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart'
        }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/Knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare'
        }
      },
      {
        path: 'consultations',
        component: () => import('@/views/Consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message'
        }
      },
      {
        path: 'emotional',
        component: () => import('@/views/Emotional.vue'),
        meta: {
          title: '情感日志',
          icon: 'User'
        }
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: () => import('@/views/Login.vue'),
        meta: {
          title: '登录',
          icon: 'Login'
        }
      },
      {
        path: 'register',
        component: () => import('@/views/Register.vue'),
        meta: {
          title: '注册',
          icon: 'User'
        }
      }
    ]
  }
]

const frontendRoutes = [
  {
    path: '/',
    component: FrontendLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'consultation',
        component: () => import('@/views/Consultation.vue'),
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/EmotionDiary.vue'),
      },
      {
        path: 'frontendknowledge',
        component: () => import('@/views/FrontendKnowledge.vue'),
      },
      {
        path: 'knowledge/article/:id',
        component: () => import('@/views/articleDetail.vue'),
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontendRoutes]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  //当前用户是否登录
  if (token) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    // 如果是后台用户
    if (userInfo.userType === 2) {
      if (to.path.startsWith('/back')) {
        next()
      } else {
        next('/back/dashboard')
      }
    } else if (userInfo.userType === 1) {
      //用户端账号只能访问前台路由
      if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
        next('/')
      } else {
        next()
      }
    } 
  } else {
    // 没有 token，允许访问登录/注册页面
    if (to.path.startsWith('/back')) {
      next('/auth/login')
    } else {
      next()
    }
  }
})

export default router