import React from 'react';
import "@arco-design/web-react/dist/css/arco.css";
import { Layout, Menu } from '@arco-design/web-react';

class ClassApp extends React.Component {
    ref = null
    constructor(props) {
        super(props); // 用于父子组件传值
        this.state = {
            headTitle: null,
            collapsed: null,
            marginLeft: '',
        }
    }

    render() {
        const { Component, pageProps } = this.props
      
        return <>
            <Component {...pageProps} ref={this.refUpdate} updateTitle={this.updateTitle} />

        </>
    }
}
export default ClassApp