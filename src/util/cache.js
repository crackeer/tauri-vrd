import { writeTextFile, BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import dayjs from 'dayjs';

const MenuCollapsed = "MenuCollapsed";
const OpenFiles = "OpenFiles";

const VRDir = "VRDir"
const VRFiles = "VRFiles"
const Project = "Project"
const ProjectSaveDir = "ProjectSaveDir"
const CacheHost = "CacheHost"

var get = async (key) => {
    try {
        let value =  await readTextFile(key, { dir: BaseDirectory.Cache });
        return value
    } catch(e) {
        return ''
    }
}

var set = async (key, value) => {
    try {
        return await writeTextFile(key, value, { dir: BaseDirectory.Cache });
    } catch(e) {
        return false;
    }
}

var getMenuCollapsed = async () => {
    let value = await get(MenuCollapsed)
    return parseInt(value)
}

var setMenuCollapsed = async (value) => {
    return await set(MenuCollapsed, value +'')
}


var getOpenFiles = async () => {
    let value = await get(OpenFiles)
    if(value.length < 1) {
        return []
    }
    return JSON.parse(value)
}

var addFiles = (files, addFiles) => {
    files = files.filter(item => {
        return addFiles.indexOf(item.file) < 0
    })
    let date = dayjs().format('YYYY-MM-DD')
    let time = dayjs().format('HH:mm:ss')
    for (var i in addFiles) {
        files.unshift({
            'file' : addFiles[i],
            'date' : date,
            'time' : time,
        })
    }
    return files
}

var addOpenFiles = async (add) => {
    let files = await getOpenFiles()
    files = addFiles(files, add)
    await set(OpenFiles, JSON.stringify(files))
    return files
}

var deleteOpenFiles = async (addFiles) => {
    let files = await getOpenFiles()
    files = files.filter(item => {
        return addFiles.indexOf(item.file) < 0
    })
    await set(OpenFiles, JSON.stringify(files))
    return files
}

var getVRDir = async () => {
    return await get(VRDir)
}

var setVRDir = async (dir) => {
    await set(VRDir, dir +'')
}

var getVRFiles = async () => {
    let value = await get(VRFiles)
    if(value.length < 1) {
        return []
    }
    return JSON.parse(value)
}

var addVRFiles = async (add) => {
    let files = await getVRFiles()
    files = addFiles(files, add)
    await set(VRFiles, JSON.stringify(files))
    return files
}

var deleteVRFiles = async (add) => {
    let files = await getVRFiles()
    files = files.filter(item => {
        return add.indexOf(item.file) < 0
    })
    await set(VRFiles, JSON.stringify(files))
    return files
}

var getProject = async () => {
    let value = await get(Project)
    if(value.length < 1) {
        return []
    }
    return JSON.parse(value)
}

var addProject = async (add) => {
    let files = await getProject()
    files = addFiles(files, add)
    await set(Project, JSON.stringify(files))
    return files
}

var deleteProject = async (add) => {
    let files = await getProject()
    files = files.filter(item => {
        return add.indexOf(item.file) < 0
    })
    await set(Project, JSON.stringify(files))
    return files
}
var getProjectSaveDir = async () => {
    return await get(ProjectSaveDir)
}

var setProjectSaveDir = async (dir) => {
    await set(ProjectSaveDir, dir +'')
}

var getCacheHost = async () => {
    let raws = await get(CacheHost)
    try {
        return JSON.parse(raws)
    } catch(e) {
        return {
            host : '',
            privateKey : ''
        }
    }
}

var setCacheHost = async (data) => {
    await set(CacheHost, JSON.stringify(data))
}

export default {
    getMenuCollapsed,
    setMenuCollapsed, 
    getOpenFiles,
    addOpenFiles,
    deleteOpenFiles,
    getVRDir,
    setVRDir,
    getVRFiles,
    addVRFiles,
    deleteVRFiles,
    addProject,
    deleteProject,
    getProject,
    getProjectSaveDir,
    setProjectSaveDir,
    getCacheHost,
    setCacheHost
}