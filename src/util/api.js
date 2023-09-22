import { fetch, Body } from '@tauri-apps/api/http';
import lodash from 'lodash'



const getVRPageInitData = async (query) => {
    let result = await get('https://realsee.cn/api/getPageInitData', query)
    return result
}


export default {
    getVRPageInitData
}

export {
    getVRPageInitData
}