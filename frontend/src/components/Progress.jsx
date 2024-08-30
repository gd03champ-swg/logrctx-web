import React from "react";
import { LoadingOutlined, SmileOutlined, ProfileOutlined, CloudDownloadOutlined, ProjectOutlined } from '@ant-design/icons';
import { Steps } from 'antd';

const Progress = ({fetch, reduce, format, display}) => {
    return (
        <Steps
        items={[
          {
            title: 'Fetch',
            status: fetch,
            icon: fetch == 'process' ? <LoadingOutlined/> :  <CloudDownloadOutlined />,
          },
          {
            title: 'Reduce',
            status: reduce,
            icon: reduce == 'process' ? <LoadingOutlined/> :  <ProjectOutlined />,
          },
          {
            title: 'Format',
            status: format,
            icon: format == 'process' ? <LoadingOutlined/> :  <ProfileOutlined />,
          },
          {
            title: 'Display',
            status: display,
            icon: display == 'process' ? <LoadingOutlined/> :  <SmileOutlined />,
          },
        ]}
      />
    )
}

export default Progress;