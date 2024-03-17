<template>
  <el-config-provider :size="elementPlusSize" :z-index="3000" :locale="elementPlusLocale">
    <main-container />
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, ref, getCurrentInstance, watch, computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCN from 'element-plus/lib/locale/lang/zh-cn'
import setThemeMode from '@/utils/set-theme-mode'
import { useStore } from '@/stores'
import { setWindowTitle, throttle } from '@/utils'
import { ElementPlusSizeEnum, LanguageEnum } from '@/common/model'
import MainContainer from '@/views/main-container/main-container.vue'
import router from '@/router'
import { initGithubAuthorize } from '@/views/picx-config/picx-login.util'

const instance = getCurrentInstance()
const store = useStore()
const globalSettings = computed(() => store.getters.getGlobalSettings).value
const elementPlusSize = ref<ElementPlusSizeEnum>(ElementPlusSizeEnum.default)
const elementPlusLocale = ref(zhCN)

const elementPlusSizeHandle = (width: number) => {
  if (width <= 700) {
    store?.dispatch('SET_GLOBAL_SETTINGS', {
      elementPlusSize: ElementPlusSizeEnum.small,
      folded: true
    })
    elementPlusSize.value = ElementPlusSizeEnum.small
  } else if (width <= 1000) {
    store?.dispatch('SET_GLOBAL_SETTINGS', {
      elementPlusSize: ElementPlusSizeEnum.default,
      folded: false
    })
    elementPlusSize.value = ElementPlusSizeEnum.default
  } else {
    store?.dispatch('SET_GLOBAL_SETTINGS', {
      elementPlusSize: ElementPlusSizeEnum.large,
      folded: false
    })
    elementPlusSize.value = ElementPlusSizeEnum.large
  }
}

const setLanguage = (language: LanguageEnum) => {
  instance!.proxy!.$i18n.locale = 'zh-CN' // 设置 i18n 语言
  elementPlusLocale.value = zhCN // 设置 Element Plus 组件库语言
  setWindowTitle(router.currentRoute.value.meta.title as string)
}


const initSetLanguage = () => {
  // 初始化设置
  setLanguage(globalSettings.language)
}

const init = () => {
  elementPlusSizeHandle(window.innerWidth)
  window.addEventListener(
    'resize',
    throttle((e: any) => {
      elementPlusSizeHandle(e.target.innerWidth)
    }, 600)
  )

  setThemeMode()
  initSetLanguage()
  initGithubAuthorize()
}

watch(
  () => globalSettings.language,
  (language: LanguageEnum) => {
    setLanguage(language)
  }
)

onMounted(() => {
  init()
})
</script>@/views/picx-config/picx-login.util
