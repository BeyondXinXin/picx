import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import upload from '@/views/upload-image/upload-image.vue'
import config from '@/views/picx-config/picx-config.vue'
import management from '@/views/imgs-management/imgs-management.vue'
import { setWindowTitle } from '@/utils'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'config',
    component: config,
    meta: {
      title: 'nav.config'
    }
  },
  {
    path: '/upload',
    name: 'upload',
    component: upload,
    meta: {
      title: 'nav.upload'
    }
  },
  {
    path: '/management',
    name: 'Management',
    component: management,
    meta: {
      title: 'nav.management'
    }
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    setWindowTitle(to.meta.title as string)
  }
  next()
})

export default router
