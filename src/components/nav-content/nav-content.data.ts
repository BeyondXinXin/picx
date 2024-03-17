import { shallowRef } from 'vue'
import { getUuid } from '@/utils'

export const navInfoList = shallowRef([
  {
    uuid: getUuid(),
    name: 'nav.config',
    icon: IEpEdit,
    isActive: false,
    path: '/',
    isShow: true
  },
  {
    uuid: getUuid(),
    name: 'nav.upload',
    icon: IEpUpload,
    isActive: false,
    path: '/upload',
    isShow: true
  },
  {
    uuid: getUuid(),
    name: 'nav.management',
    icon: IEpPicture,
    isActive: false,
    path: '/management',
    isShow: true
  }
])
