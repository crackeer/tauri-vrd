import React from 'react';
import { Button, Table, Modal, List, Input, Message, Progress, Divider, Radio } from '@arco-design/web-react';
import { open } from '@tauri-apps/api/dialog';
import cache from '@/util/cache';
import invoke from '@/util/invoke'
import common from '@/util/common'
import work from '@/util/work'
import api from '@/util/api'
import { IconFolder, IconDelete, IconLoading } from '@arco-design/web-react/icon';
import { Card, Avatar, Link, Typography, Space, Grid } from '@arco-design/web-react';
import { open as ShellOpen } from '@tauri-apps/api/shell';
const Row = Grid.Row;
const Col = Grid.Col;
const RadioGroup = Radio.Group;

class App extends React.Component {
    timer = null
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            saveName: "",
            workJSON: "",
            vrURL: "",
            saveDir: "",
            files: [],
            runningTask: {},
        }
    }
    async componentDidMount() {
        this.getVRFiles()
        this.queryTaskState()
        this.ifDownloadNew()
    }
    ifDownloadNew = async () => {
        let vrCode = common.getQuery('vr_code', '')
        if (vrCode.length < 1) {
            return
        }
        let result = await api.getWorkJSON(vrCode)
        if (result.code != 0) {
            Message.error(result.status)
            return
        }
        await this.setState({
            visible: true,
            saveName: vrCode,
            workJSON: JSON.stringify(result.data),
        })
    }
    getVRFiles = async () => {
        let files = await cache.getVRFiles()
        let dir = await cache.getVRDir()
        this.setState({
            files: files,
            saveDir: dir,
        })
    }
    htmlTitle = () => {
        return <h3><Space>
            VR下载
            <Button onClick={this.addTask} type="primary" size="mini">新建VR下载任务</Button>
        </Space></h3>
    }
    addTask = async () => {
        this.setState({
            visible: true,
        })
    }
    selectDirectory = async () => {
        let selected = await open({
            directory: true,
            filters: [{
                name: 'File',
                extensions: []
            }],

        });
        if (selected == null) {
            return
        }
        await cache.setVRDir(selected)
        this.getVRFiles()
    }

    toDelete = async (item) => {
        let list = await cache.deleteVRFiles([item.file])
        this.setState({
            files: list
        })
    }
    openVRDir = async (item) => {
        await ShellOpen(item.file)
    }
    addDownloadTask = async () => {
        if (this.state.saveDir.length < 1) {
            Message.error('Please select download directory')
            return
        }
        if (this.state.saveName.length < 1) {
            Message.error('Please input download name')
            return
        }
        if (this.state.workJSON.length < 1) {
            Message.error('Please input work JSON')
            return
        }
        const {join} = await import('@tauri-apps/api/path');
        let realPath = await join(this.state.saveDir, this.state.saveName);
        let dd = await invoke.fileExists(realPath)
        if(dd) {
            Message.info('该VR已下载，或者已在下载列表,请换')
            return
        }
        let data = await invoke.addDownloadWorkTask(realPath, this.state.workJSON)
        if (data.state == "failure") {
            Message.error(data.message)
            return
        }
        await cache.addVRFiles([realPath])
        await this.getVRFiles()
        this.setState({
            visible: false,
            saveName: '',
            workJSON: ''
        })
    }
    queryTaskState = async () => {
        let data = await invoke.queryDownloadTask()
        let tasks = Object.keys(data);
        await this.setState({
            runningTask: data,
        })
        setTimeout(this.queryTaskState, 2000)
    }
    previewVR = async (file) => {
        await ShellOpen(file + '/preview/index.html')
    }
    parseWorkJSON = async () => {
        if (this.state.vrURL.length < 1) {
            Message.error('请输入VR链接')
            return
        }
        //let data = await invoke.parseJSCode(this.state.vrURL)
        // console.log(JSON.stringify(data))
        let workJSON = await work.getWorkJSONByURL(this.state.vrURL)
        if(workJSON == null) {
            Message.error('解析work.json失败')
            return
        }
        let htmlTitle = await invoke.parseHTMLTitle(this.state.vrURL)
        await this.setState({
            workJSON: JSON.stringify(workJSON),
            saveName : htmlTitle
        })
    }

    render() {
        return (
            <div class="app" style={{ margin: '10px auto', width: '88%' }}>
                <List dataSource={this.state.files} size={'small'} render={(item, index) => {
                    return <List.Item key={index} actions={[
                        <span className='list-demo-actions-icon' onClick={() => {
                            this.previewVR(item.file);
                        }}>
                            VR预览
                        </span>,
                        <span className='list-demo-actions-icon' onClick={() => {
                            this.toDelete(item);
                        }}>
                            删除记录
                        </span>
                    ]} >
                        <List.Item.Meta
                            avatar={<Avatar shape='square'>VR</Avatar>}
                            title={<Link href={null} onClick={() => this.openVRDir(item)}>{item.file}</Link>}
                            description={this.state.runningTask[item.file] != undefined ? <>
                                <TaskState data={this.state.runningTask[item.file]} />
                            </> : null}
                        />
                    </List.Item>
                }} />
                <Modal
                    title='新建下载VR任务'
                    visible={this.state.visible}
                    onCancel={() => {
                        this.setState({ visible: false })
                    }}
                    style={{ width: '65%' }}
                    onOk={this.addDownloadTask}
                >
                    <p><strong>下载目录:</strong></p>
                    <Input.Search value={this.state.saveDir} onChange={(val) => { this.setState({ saveDir: val }) }} searchButton={
                        "选择目录"
                    } defaultValue={this.state.saveDir} placeholder='请选择目录' onSearch={this.selectDirectory} />

                    <Card style={{marginTop:'10px'}} title="输入URL获取work.json" size='small'>
                        <Input.Search value={this.state.vrURL} onChange={(val) => { this.setState({ vrURL: val }) }} searchButton={
                            "解析"
                        } defaultValue={this.state.vrURL} placeholder='请输入vr链接' onSearch={this.parseWorkJSON} />
                    </Card>
                    <p><strong>VR名称:</strong></p>
                    <Input value={this.state.saveName} onChange={(val) => { this.setState({ saveName: val }) }} />
                    <p><strong>work.json:</strong></p>
                    <Input.TextArea value={this.state.workJSON} onChange={(val) => { this.setState({ workJSON: val }) }} rows={6}></Input.TextArea>
                </Modal>
            </div>
        )
    }
}

const TaskState = (props) => {
    if (props.data.state == 'success') {
        return <>下载成功</>
    }
    if (props.data.state == 'failure') {
        return <>下载失败，{props.data.message}</>
    }

    if (props.data.state == 'running') {
        if (props.data.percent > 0) {
            return <>下载中<Progress percent={props.data.percent} /></>
        }
        return <>下载中</>
    }

    if (props.data.state == 'waiting') {
        return <>等待下载</>
    }
    return <>{props.state}</>
}

export default App
