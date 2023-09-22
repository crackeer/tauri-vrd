import { fetch, Body } from '@tauri-apps/api/http';
import common from './common'
import lodash from 'lodash'

const getHost = () => {
    return 'http://10.11.1.3'
}

const formatURL = (url) => {
    if (lodash.startsWith(url, 'http://')) {
        return url
    }
    if (lodash.startsWith(url, 'https://')) {
        return url
    }

    return getHost() + url
}

const get = async (url, query, headers) => {
    url = formatURL(url)
    if (query != null) {
        url = url + '?' + common.httpBuildQuery(query)
    }
    try {
        let result = await fetch(url, {
            method: 'GET',
            headers,
        })
        console.log("GET", url, result)
        return result.data
    } catch (e) {
        return {
            "code": -101,
            "status": e,
            "data": null,
        }
    }
}

const post = async (url, data, headers) => {
    url = formatURL(url)
    headers = lodash.merge({
        'Content-Type': 'application/json'
    }, headers)
    try {
        let result = await fetch(url, {
            method: 'POST',
            timeout: 1,
            body: Body.json(data),
            headers: headers,
        })
        console.log("POST", url, data, result)
        return result.data
    } catch (e) {
        console.log(e)
        return {
            "code": -101,
            "status": e,
            "data": null,
        }

    }

}

const getTFState = async () => {
    let result = await get('http://10.11.1.3/__proxy__/calcnode/api_tf_state')
    return result
}

const getTFProjects = async () => {
    let result = await get('http://10.11.1.3/__proxy__/calcnode/api_tf_projects_ls')
    if (result.code != 0) {
        return []
    }
    let list = []
    let pids = result.data.Result
    for (var i in pids) {
        let project = await get('http://10.11.1.3/__proxy__/calcnode/api_tf_projects_cat?project_id=' + pids[i])
        let tmp = {
            project_id: project.data.Result.ProjectID,
            title: project.data.Result.Data.title,
            description: project.data.Result.Data.description,
            db_version: project.data.Result.Data.dbVersion,
            sensor_height: project.data.Result.Data.sensor_height,
            sensor_width: project.data.Result.Data.sensor_width,
            observer_count: project.data.Result.Scans.length,
            create_time: common.convertTs2Time(project.data.Result.Create_At),
        }
        list.push(tmp)
    }
    return list
}

const getTFImportLog = async () => {
    let result = await get('http://10.11.1.3/__proxy__/calcnode/api_tf_autoimport_log_cat')
    if (result.data.Result == undefined || result.data.Result.Importing == undefined) {
        return []
    }
    let list = result.data.Result.Importing
    let retData = []
    for (var i in list) {
        let tmp = {
            uuid: list[i].UUID,
            start_time: common.convertTs2Time(list[i].Started),
            end_time: common.convertTs2Time(list[i].Finished),
            projects: [],
            project_count: 0,
            cost: list[i].Finished - list[i].Started
        }
        if (list[i].Projects != undefined) {
            let projects = list[i].Projects
            let allProject = []
            if (projects.Succeeded != undefined) {
                tmp['project_count'] += list[i].Projects.Succeeded.length
                for (var j in projects.Succeeded) {
                    allProject.push({
                        project_id: projects.Succeeded[j].ID,
                        start_time: common.convertTs2Time(projects.Succeeded[j].Started),
                        end_time: common.convertTs2Time(projects.Succeeded[j].Ended),
                        cost: projects.Succeeded[j].Ended - projects.Succeeded[j].Started,
                        status: 'success'
                    })
                }
            }
            if (projects.Failed != undefined) {
                tmp['project_count'] += list[i].Projects.Failed.length
                for (var k in projects.Failed) {
                    allProject.push({
                        project_id: projects.Failed[k].ID,
                        start_time: common.convertTs2Time(projects.Failed[k].Started),
                        end_time: common.convertTs2Time(projects.Failed[k].Ended),
                        error_code: projects.Failed[k].Error.Code,
                        error_message: projects.Failed[k].Error.String,
                        cost: projects.Failed[k].Ended - projects.Failed[k].Started,
                        status: 'failure'
                    })
                }
            }
            tmp['projects'] = allProject
        }
        retData.push(tmp)
    }
    return retData
}

const getTFVRFileList = async () => {
    let result = await get('http://10.11.1.3/__proxy__/calcnode/api_tf_vrfile_ls')
    if (result == null) {
        return []
    }
    if (!result.data.Success) {
        return []
    }
    return result.data.Result
}

const queryVrapi = async (query) => {
    let result = await post('http://10.11.1.3/__proxy__/opensvc/util_database_vrapi', query)
    if (result == null) {
        return {
            list: [],
            total_page: 0,
            total: 0,
        }
    }
    return result.data
}

const queryVrapiV2 = async (query) => {
    let result = await post('http://10.11.1.3/__proxy__/opensvc/util_database_vrapi', query)
    if (result == null) {
        return {
            data: {
                list: [],
                total_page: 0,
                total: 0,
            },
            code: -99,
            status: 'query erro'
        }
    }
    return result
}

const queryShepherd = async (query) => {
    let result = await post('http://10.11.1.3/__proxy__/shepherd/util_database_shepherd', query)
    if (result == null) {
        return {
            list: [],
            total_page: 0,
            total: 0,
        }
    }
    return result.data
}

const decodeWorkCode = async (query) => {
    let result = await get('http://10.11.1.3/__proxy__/opensvc/util_decode_work_code', query)
    return result.data
}

const getAccessToken = async (query) => {
    let result = await post('/auth/access_token', {
        'app_key': 'bE0y67lybBZRJr9O',
        'app_secret': '8R3AGNFE1FGAGCI48BRDWCF5LY95ZC8J'
    })
    return result.data
}

const getNucSystemInfo = async () => {
    let result = await get('/__proxy__/calcnode/api_system_info')
    return result
}

const setNucTime = async (ts) => {
    let result = await get('/__proxy__/calcnode/api_hardware_rtc_set?timestamp=' + ts)
    return result
}

const updateVrTaskGlobalParams = async (value) => {
    let result = await post('/__proxy__/opensvc/strategy_update', {
        "name": "realsee-open-svc",
        "key": "vr_task.global_alg_params",
        "value": JSON.stringify(value)
    })
    return result
}

const updateVRFileLocalConfig = async (value) => {
    let result = await post('/__proxy__/opensvc/strategy_update', {
        "name": "vrfile",
        "key": "local_config",
        "value": JSON.stringify(value)
    })
    return result
}

const getWorkJSON = async (vrCode) => {
    let accessToken = await getAccessToken()
    if (accessToken == null || accessToken.access_token == undefined) {
        return {
            code: -1,
            status: 'get access_token failed'
        }
    }
    let result = await get('/open/v1/entity/vr', {
        vr_code: vrCode
    }, {
        Authorization: accessToken.access_token
    })
    return result
}

const shutdownNuc = async () => {
    console.log("ShutDown NUC")
    let result = await get('/__proxy__/calcnode/api_system_shutdown')
    return result
}

const getVRPageInitData = async (query) => {
    let result = await get('https://realsee.cn/api/getPageInitData', query)
    return result
}


export default {
    getTFState, getTFProjects, getTFImportLog, getTFVRFileList, queryVrapi, queryVrapiV2, queryShepherd, decodeWorkCode, getAccessToken, getNucSystemInfo, setNucTime, updateVrTaskGlobalParams, updateVRFileLocalConfig, getWorkJSON, shutdownNuc, getVRPageInitData
}

export {
    getTFState, getTFProjects, getTFImportLog, getTFVRFileList, queryVrapi, queryVrapiV2, queryShepherd, decodeWorkCode, getAccessToken, getNucSystemInfo,
    setNucTime, updateVrTaskGlobalParams, updateVRFileLocalConfig, getWorkJSON, shutdownNuc, getVRPageInitData
}