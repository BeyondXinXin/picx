<template>
  <div class="page-container config-page-container">

    <div v-if="!userConfigInfo.token">
      <el-button class="row-item" plain type="primary" @click="onGitHubAuthorizeLogin" size="large"
        :loading="authorizeLoading">
        {{ $t('authorization.text_1') }}
      </el-button>
    </div>

    <div v-if="userConfigInfo.token">
      <el-collapse class="row-item">
        <!-- 基本信息 -->
        <el-collapse-item title="基本信息" name="0">

          <el-descriptions class="row-item" v-if="userConfigInfo.token" :column="1" border>
            <!-- 用户名 -->
            <el-descriptions-item v-if="userConfigInfo.owner">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <IEpUser />
                  </el-icon>
                  {{ $t('username') }}
                </div>
              </template>
              <div type="primary">
                {{ userConfigInfo.owner }}
              </div>
            </el-descriptions-item>

            <!-- 仓库 -->
            <el-descriptions-item v-if="userConfigInfo.repo">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <IEpConnection />
                  </el-icon>
                  {{ $t('repo') }}
                </div>
              </template>
              <div type="primary">
                {{ userConfigInfo.repo }}
              </div>

            </el-descriptions-item>

            <!-- 目录  -->
            <el-descriptions-item :span="2" v-if="userConfigInfo.repo && userConfigInfo.branch">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <IEpFolder />
                  </el-icon>
                  {{ $t('dir') }}
                </div>
              </template>
              <div class="dir-box border-box">
                <el-radio-group class="dir-item" v-model="userConfigInfo.dirMode" @change="dirModeChange">

                  <el-radio label="dateDir">{{ $t('config_page.date_dir') }}</el-radio>
                  <el-radio label="repoDir" v-if="userConfigInfo.dirList.length">
                    {{ $t('config_page.repo_dir') }}</el-radio>

                </el-radio-group>

                <!-- 根目录 / 日期目录 -->
                <el-input class="dir-item" v-if="userConfigInfo.dirMode === DirModeEnum.dateDir"
                  v-model="userConfigInfo.selectedDir" readonly></el-input>

                <!-- 仓库目录 -->
                <div class="dir-item" v-if="userConfigInfo.dirMode === DirModeEnum.repoDir">
                  <repo-dir-cascader :el-key="repoDirCascaderKey" :el-size="globalSettings.elementPlusSize"
                    :el-clearable="true" :style="{ width: 'calc(100% - ' + refreshIconWidth + 'rem)' }" />
                  <el-icon class="refresh-icon" :style="{ width: refreshIconWidth + 'rem' }" @click="refreshDirData">
                    <IEpRefresh />
                  </el-icon>
                </div>

              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 图片链接规则配置 -->
        <el-collapse-item :title="$t('settings_page.link_rule.title')" name="4">
          <ul class="setting-list">
            <li class="setting-item cdn">
              {{ $t('settings_page.link_rule.select_title') }}：
              <el-select v-model="userSettings.imageLinkType.selected" @change="saveUserSettings">
                <el-option v-for="item in userSettings.imageLinkType.presetList" :key="item.name + '-' + item.id"
                  :label="item.name" :value="item.name" :disabled="isGitHubPagesDeployed(item.name)"
                  class="image-link-type-rule-option">
                  <span class="left">{{ item.name }}</span>
                  <span class="right">{{ item.rule }}</span>
                </el-option>
              </el-select>
            </li>
            <li class="setting-item" style="margin-top: 20rem">
              <image-link-rule-config />
            </li>
          </ul>
        </el-collapse-item>

      </el-collapse>


      <div class="row-item" v-if="userConfigInfo.logined">
        <deploy-status-bar />
      </div>

      <div class="row-item" v-if="userConfigInfo.logined">
        <cloud-settings-bar />
      </div>

    </div>


  </div>


</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from '@/stores'
import { DirModeEnum } from '@/common/model'
import { formatDatetime, getGitHubOwnerURL, getImageHostingURL } from '@/utils'
import {
  goUploadPage,
  oneClickAutoConfig,
  persistUserConfigInfo
} from '@/views/picx-config/picx-config.util'
import router from '@/router'
import { isAuthorizeExpire } from '@/views/picx-config/picx-login.util'
import { getDirInfoList } from '@/common/api'
import i18n from '@/plugins/vue/i18n'
import { ImageLinkTypeEnum, ThemeModeEnum, UserSettingsModel } from '@/common/model'
import {
  githubAppAuthorize, githubAppAuthorizeCallback
} from '@/views/picx-config/picx-login.util'


const store = useStore()

const refreshIconWidth = ref(32)

const userConfigInfo = computed(() => store.getters.getUserConfigInfo).value
const globalSettings = computed(() => store.getters.getGlobalSettings).value

const newDirInputRef = ref<null | HTMLElement>(null)
const tokenInputRef = ref<HTMLElement | null>(null)
const repoDirCascaderKey = ref<string>('repoDirCascaderKey')
const userSettings = computed(() => store.getters.getUserSettings).value
const deployStatusInfo = computed(() => store.getters.getDeployStatusInfo).value
const authorizeLoading = ref(false)
const authorizationInfo = computed(() => store.getters.getGitHubAuthorizationInfo).value

const dirModeChange = (dirMode: DirModeEnum) => {
  switch (dirMode) {

    // 日期目录，根据当天日期自动生成
    case DirModeEnum.dateDir:
      userConfigInfo.selectedDir = formatDatetime('yyyyMMdd')
      break

    // 仓库目录
    case DirModeEnum.repoDir:
      userConfigInfo.selectedDir = ''
      if (userConfigInfo.selectedDirList.length) {
        userConfigInfo.selectedDir = userConfigInfo.selectedDirList.join('/')
      }
      break

    default:
      userConfigInfo.selectedDir = '/'
      break
  }
  persistUserConfigInfo()
}

const authorizeAutoConfig = () => {
  const { token, isAutoAuthorize } = computed(() => store.getters.getGitHubAuthorizationInfo).value

  if (isAutoAuthorize && token && !isAuthorizeExpire() && router.currentRoute.value.query.auto) {
    oneClickAutoConfig(tokenInputRef.value)
  }
}

const refreshDirData = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: i18n.global.t('config_page.loading_4')
  })
  userConfigInfo.dirList = await getDirInfoList(userConfigInfo)
  loading.close()
  await store.dispatch('USER_CONFIG_INFO_PERSIST')
}

const persistUserSettings = () => {
  store.dispatch('USER_SETTINGS_PERSIST')
}

const persistGlobalSettings = () => {
  store.dispatch('USER_GLOBAL_PERSIST')
}

const saveUserSettings = () => {
  store.dispatch('SET_USER_SETTINGS', {
    ...userSettings
  })
}

const setWatermarkConfig = (config: UserSettingsModel['watermark']) => {
  userSettings.watermark.text = config.text
  userSettings.watermark.textColor = config.textColor
  userSettings.watermark.opacity = config.opacity
  userSettings.watermark.position = config.position
  userSettings.watermark.fontSize = config.fontSize
  persistUserSettings()
}

const isGitHubPagesDeployed = (name: string) => {
  return name === ImageLinkTypeEnum.GitHubPages && !deployStatusInfo.github.status
}


const onGitHubAuthorizeLogin = () => {
  authorizeLoading.value = true
  store.dispatch('SET_GITHUB_AUTHORIZATION_INFO', {
    isAutoAuthorize: true
  })
  const { authorized, installed, token } = authorizationInfo
  if (authorized && installed && token && !isAuthorizeExpire()) {
    store.dispatch('SET_USER_CONFIG_INFO', {
      token
    })
    router.push('/')
  } else {
    githubAppAuthorize()
  }
}

onMounted(() => {
  githubAppAuthorizeCallback()
  setTimeout(() => {
    if (!userConfigInfo.token || router.currentRoute.value.query.focus === '1') {
      tokenInputRef.value?.focus()
    }
    authorizeAutoConfig()
  }, 100)
})


</script>

<style scoped lang="stylus">
@import "picx-config.styl"
</style>@/views/picx-config/picx-login.util@/views/picx-config/picx-login.util
