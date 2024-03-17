<template>

  <el-popover v-if="userConfigInfo.logined" placement="bottom-end" trigger="click" width="240rem" :show-arrow="false"
    :popper-style="{
    padding: '0',
    'border-radius': '10rem',
    overflow: 'hidden'
  }">

    <template #reference>
      <div class="user-avatar-v2 border-box" :class="{ folded: store.getters.getGlobalSettings.folded }">
        <div class="avatar flex-center">
          <img :src="userConfigInfo?.avatarUrl" v-if="userConfigInfo?.avatarUrl" :alt="userConfigInfo?.owner" />
          <el-icon class="user-filled-icon" v-else>
            <IEpUserFilled />
          </el-icon>
        </div>
        <el-icon class="popover-tip-icon">
          <IEpCaretBottom />
        </el-icon>
      </div>
    </template>

    <ul class="personal-center-popover border-box">

      <li class="user-info border-box">
        <div class="info-item name" v-if="userConfigInfo.owner">{{ userConfigInfo.owner }}</div>
      </li>

      <li class="content-item border-box" v-if="userConfigInfo.name || userConfigInfo.owner" @click="onLogout">
        {{ $t('logout') }}
      </li>

    </ul>

  </el-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { getGitHubOwnerURL } from '@/utils'
import { LanguageEnum, ThemeModeEnum } from '@/common/model'

const router = useRouter()
const store = useStore()

const userConfigInfo = computed(() => store.getters.getUserConfigInfo).value
const globalSettings = computed(() => store.getters.getGlobalSettings).value

const onLogin = () => {
  router.push('/login')
  document.body.click()
}

// 退出登录
const onLogout = () => {
  store.dispatch('LOGOUT')
  router.push('/login')
  document.body.click()
  setTimeout(() => {
    window.location.reload()
  })
}

const persistGlobalSettings = () => {
  store.dispatch('USER_GLOBAL_PERSIST')
}
</script>

<style scoped lang="stylus">
@import "user-avatar-v2.styl"
</style>
