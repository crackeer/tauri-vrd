import { invoke } from '@tauri-apps/api/tauri'


var writeFile = async (file, content) => {
    let Result = await invoke('write_file', {
        name: file, content: content,
    })
    return Result
}

var readFile = async (file, content) => {
    let Result = await invoke('get_file_content', {
        name: file, content: content,
    })
    return Result
}


var readDir = async (dir, ext) => {
    let list = await invoke('get_file_list', {
        dir, ext
    })
    return list
}

var simpleReadDir = async (dir, ext) => {
    let list = await invoke('simple_read_dir', {
        dir, ext
    })
    return list
}

var setWindowTitle = async (title) => {
    let result = await invoke('set_window_title', {
        title
    })
    return result
}

var uploadFile = async (dir, name, content) => {
    let result = await invoke('write_media_file', {
        dir: dir,
        name: name,
        content: content,
    })
    return result
}

var createFile = async (file_path) => {
    let result = await invoke('create_file', {
        filePath: file_path,
    })
    return result
}

var deleteFile = async (file_path) => {
    let result = await invoke('delete_file', {
        filePath: file_path,
    })
    return result
}

var deleteFolder = async (file_path) => {
    let result = await invoke('delete_folder', {
        filePath: file_path,
    })
    return result
}

var createDir = async (file_path) => {
    let result = await invoke('create_dir', {
        filePath: file_path,
    })
    return result
}


var renameFile = async (filePath, newFilePath) => {
    let result = await invoke('rename_file', {
        filePath: filePath,
        newFilePath: newFilePath
    })
    return result
}

var fileExists = async (filePath) => {
    let result = await invoke('file_exists', {
        filePath: filePath,
    })
    return result
}

var addDownloadWorkTask = async (dir, work_json) => {
    let result = await invoke('add_work_download_task', {
        dir: dir,
        workJson: work_json,
    })
    return result
}

var queryDownloadTask = async (dir, work_json) => {
    let result = await invoke('query_all_task_state', {})
    return result

}

var addProjectDownload = async (dir, project_id, db_version) => {
    let result = await invoke('add_project_download_task', {
        dir: dir,
        projectId: project_id,
        dbVersion: db_version
    })
    return result
}


var queryProjectDownloadTask = async (dir, project_id, db_version) => {
    let result = await invoke('query_project_download_state')
    return result
}

var parseJSCode = async (url) => {
    let result = await invoke('parse_js_code', {
        url
    })
    return result
}

var parseHTMLTitle = async (url) => {
    let result = await invoke('parse_html_title', {
        url
    })
    return result
}

var getLocalConfig = async (host, privateKeyPath) => {
    let result = await invoke('get_local_config', {
        host, privateKeyPath
    })
    return splitMySQLLine(result)
}

var splitMySQLLine = (dataString) => {
    let parts = dataString.split('\n')
    parts.shift()
    return parts
}

var updateOuterHost = async (host, privateKeyPath, oldHost, newHost) => {
    let result = await invoke('update_outer_host', {
        host, privateKeyPath, oldHost, newHost
    })
    return result
}

var listFiles = async (host, privateKeyPath, path) => {
    let result = await invoke('list_files', {
        host, privateKeyPath, path
    })
    return result
}

var downloadRemoteFile = async (host, privateKeyPath, path, localSavePath) => {
    let result = await invoke('download_remote_file', {
        host, privateKeyPath, path, localSavePath
    })
    return result
}


var uploadRemoteFile = async (host, privateKeyPath, path, localFile) => {
    let result = await invoke('upload_remote_file', {
        host, privateKeyPath, path, localFile
    })
    return result
}

var deleteRemoteFile = async (host, privateKeyPath, path) => {
    let result = await invoke('remote_exec_cmd', {
        host, privateKeyPath,
        cmdString: "rm -rf " + path
    })
    return result
}


var newRemoteDirectory = async (host, privateKeyPath, path) => {
    let result = await invoke('remote_exec_cmd', {
        host, privateKeyPath,
        cmdString: "mkdir -p " + path
    })
    return result
}


export {
    writeFile, readFile, readDir, simpleReadDir, setWindowTitle, uploadFile, createFile, createDir, deleteFile, deleteFolder, renameFile, fileExists, addDownloadWorkTask, queryDownloadTask, addProjectDownload, queryProjectDownloadTask, parseJSCode, parseHTMLTitle, getLocalConfig, updateOuterHost, listFiles, downloadRemoteFile, uploadRemoteFile, deleteRemoteFile, newRemoteDirectory
}

export default {
    writeFile, readFile, readDir, simpleReadDir, setWindowTitle, uploadFile, createFile, createDir, deleteFile, deleteFolder, renameFile, fileExists, addDownloadWorkTask, queryDownloadTask, addProjectDownload, queryProjectDownloadTask, parseJSCode, parseHTMLTitle, getLocalConfig, updateOuterHost, listFiles, downloadRemoteFile, uploadRemoteFile, deleteRemoteFile, newRemoteDirectory
}
