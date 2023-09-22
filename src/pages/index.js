import React from 'react';
import { Button, Table, Modal, List, Input, Message, Progress, Divider, Radio, Form } from '@arco-design/web-react';
import { open } from '@tauri-apps/api/dialog';
import cache from '@/util/cache';
import invoke from '@/util/invoke'
import work from '@/util/work'
import dayjs from 'dayjs';
import { Card, Avatar, Link, Typography, Space, Grid } from '@arco-design/web-react';
import { open as ShellOpen } from '@tauri-apps/api/shell';
const Row = Grid.Row;
const Col = Grid.Col;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;


const VRFile = 'vr_file'
const VRFileDirectory = 'vr_file_directory'

class App extends React.Component {
    timer = null
    constructor(props) {
        super(props);
        this.state = {
            dataType: 'vr_link',
            vrData: '',
            saveName: "",
            workJSON: "",
            saveDir: "",
            vrList: [],
            runningTask: {},
        }
    }
    async componentDidMount() {
        this.getVRFiles()
        this.queryTaskState()
    }
    getVRFiles = async () => {
        let files = await cache.getJSON(VRFile) || []
        console.log(files)
        let dir = await cache.getText(VRFileDirectory)
        this.setState({
            vrList: files,
            saveDir: dir,
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
        await cache.setText(VRFileDirectory, selected)
        this.getVRFiles()
    }

    toDelete = async (item) => {
        this.state.vrList = this.state.vrList.filter((d) => {
            return item.directory != d.directory
        })
        cache.setJSON(VRFile, this.state.vrList)
        this.getVRFiles()
    }
    openVRDir = async (item) => {
        await ShellOpen(item.directory)
    }
    addDownloadTask = async () => {
        if (this.state.saveDir.length < 1) {
            Message.error('请选择下载目录')
            return
        }
        if (this.state.saveName.length < 1) {
            Message.error('请输入VR名字')
            return
        }
        var workJSON = this.state.vrData
        if (this.state.dataType == 'vr_link') {
            if (this.state.vrData.length < 1) {
                Message.error('请输入VR链接')
                return
            }
            let result = await work.getWorkJSONByURL(this.state.vrData)
            if (result == null) {
                Message.error('解析work.json失败')
                return
            }
            workJSON = JSON.stringify(result)
        }


        const { join } = await import('@tauri-apps/api/path');
        let realPath = await join(this.state.saveDir, dayjs().format('YYYY-MM-DD-HH-mm-ss'));
        let dd = await invoke.fileExists(realPath)
        if (dd) {
            Message.info('该VR已下载，或者已在下载列表,请换')
            return
        }
        
        let data = await invoke.addDownloadWorkTask(realPath, workJSON)
        if (data.state == "failure") {
            Message.error(data.message)
            return
        }

        let tmpList = JSON.parse(JSON.stringify(this.state.vrList));
        tmpList.unshift({
            'name': this.state.saveName,
            'directory': realPath,
            'time': dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
        console.log(tmpList)
        await cache.setJSON(VRFile, tmpList)
        await this.getVRFiles()
        this.setState({
            saveName: '',
            vrData: ''
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

    render() {
        return (
            <div >
                <Card title={<h3>VR下载</h3>} style={{ width: '70%', margin: '10px auto', }} >
                    <Form>
                        <FormItem label="数据类型">
                            <RadioGroup defaultValue={this.state.dataType} onChange={(val) => {
                                this.setState({ dataType: val });
                            }}>
                                <Radio value='vr_link'>VR链接</Radio>
                                <Radio value='vr_data'>VR数据</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label={this.state.dataType == 'vr_link' ? 'VR链接' : 'VR数据'}>
                            <Input.TextArea value={this.state.vrData} onChange={(val) => { this.setState({ vrData: val }) }} rows={3}></Input.TextArea>
                        </FormItem>
                        <FormItem label="名称">
                            <Input value={this.state.saveName} onChange={(val) => { this.setState({ saveName: val }) }} />
                        </FormItem>
                        <FormItem label="下载到">
                            <Input.Search value={this.state.saveDir} onChange={(val) => { this.setState({ saveDir: val }) }} searchButton={
                                "选择目录"
                            } defaultValue={this.state.saveDir} placeholder='请选择目录' onSearch={this.selectDirectory} />
                        </FormItem>
                        <FormItem wrapperCol={{ offset: 5 }}>
                            <Button type="primary" onClick={this.addDownloadTask}>确认下载</Button>
                        </FormItem>
                    </Form>
                </Card>
                <div style={{ width: '70%', margin: '10px auto', }} >
                    <h1>下载记录</h1>
                    <List dataSource={this.state.vrList} size={'small'} render={(item, index) => {
                        return <List.Item key={index} actions={[
                            <span className='list-demo-actions-icon' onClick={() => {
                                this.previewVR(item.directory);
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
                                title={<strong>{item.name}</strong>}
                                description={<>
                                    <Link href={null} onClick={() => this.openVRDir(item)}>{item.directory}</Link>
                                    {
                                        this.state.runningTask[item.directory] != undefined ? <>
                                            <TaskState data={this.state.runningTask[item.directory]} />
                                        </> : null
                                    }
                                </>
                                }
                            />
                        </List.Item>
                    }} />
                </div>
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
