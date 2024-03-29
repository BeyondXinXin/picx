<template>
  <aside class="nav-content-container border-box" :class="{ folded: store.getters.getGlobalSettings.folded }">

    <div class="top-box border-box">

      <ul class="nav-menu-list border-box">

        <el-tooltip placement="left" :content="$t(nav.name)" v-for="(nav, idx) in navInfoList" :key="idx + nav.uuid"
          :show-arrow="false" :disabled="!store.getters.getGlobalSettings.folded">

          <li class="nav-menu-item border-box" :class="{ active: nav.isActive }" @click="onNavClick(nav)"
            v-show="nav.isShow">
            <el-icon class="nav-icon" :size="navIconSize">
              <component :is="nav.icon"></component>
            </el-icon>
            <span class="nav-name">{{ $t(nav.name) }}</span>
          </li>

        </el-tooltip>
      </ul>

    </div>

  </aside>


</template>

<script setup lang="ts">
import { computed, onMounted, triggerRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { ElementPlusSizeEnum } from '@/common/model'
import { navInfoList } from './nav-content.data'
import i18n from '@/plugins/vue/i18n'

const router = useRouter()
const store = useStore()

const userConfigInfo = computed(() => store.getters.getUserConfigInfo).value
const globalSettings = computed(() => store.getters.getGlobalSettings).value

const navIconSize = computed(() => {
  switch (globalSettings.elementPlusSize) {
    case ElementPlusSizeEnum.small:
      return 21
    case ElementPlusSizeEnum.large:
      return 25
    default:
      return 23
  }
})

const onNavClick = (e: any) => {
  const { path } = e

  if (path === '/management') {
    if (userConfigInfo.repo === '') {
      ElMessage.warning(i18n.global.t('upload_page.message2'))
      router.push('/')
      return
    }

    if (userConfigInfo.selectedDir === '') {
      ElMessage.warning(i18n.global.t('upload_page.message3'))
      router.push('/')
      return
    }
  }
  router.push(path)
}

const changeNavActive = (currentPath: string) => {
  navInfoList.value.forEach((v) => {
    const temp = v
    temp.isActive = v.path === currentPath || currentPath.includes(v.path)
    return temp
  })

  triggerRef(navInfoList)
}

const onFoldNav = () => {
  store.dispatch('SET_GLOBAL_SETTINGS', {
    folded: !globalSettings.folded
  })
}

watch(
  () => router.currentRoute.value,
  (_n) => {
    changeNavActive(_n.path)
  }
)

watch(
  () => userConfigInfo.logined,
  (_n) => {
    navInfoList.value.forEach((v: any) => {
      switch (v.path) {
        case '/management':
        case '/upload':
          v.isShow = _n
      }
    })
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
  router.isReady().then(() => {
    changeNavActive(router.currentRoute.value.path)
  })
})
</script>

<style scoped lang="stylus">
@import "nav-content.styl"
</style>
