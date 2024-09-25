import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, Radio, Collapse, Space, Table } from 'antd';
import { SearchOutlined, FullscreenOutlined, FullscreenExitOutlined, DownloadOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const LogsDisplaySection = ({
        form,
        rawLogsLen,
        reducedLogsLen,
        filteredLogs,
        filteredLogs2,
        showOnly,
        setShowOnly,
        handleSearch,
        handleDownload,
        animateButton,
        carouselRef,
        logs2,
        rawLogs2Len,
        reducedLogs2Len,
        dualServiceCompare,
        grafanaUrl,
        grafanaUrl2
    }) => {

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [wrapLines, setWrapLines] = useState(true);
    const [showTable, setShowTable] = useState(false); // Toggle for table view

    const toggleFullScreen = () => {
      setIsFullScreen(!isFullScreen);
      scrollToBottom();
      openNotification('info', 'Full Screen Mode', 'You have toggled full screen mode');
    };
    
    // Function to parse logs and extract log lines with counts
    const parseLogCount = (logs) => {
      const logMap = {};

      logs.forEach((log) => {
        const match = log.match(/\(x(\d+)\)$/); // Extract count from logs in the format (xN)
        const count = match ? parseInt(match[1], 10) : 1; // Default count is 1 if no match found
        const logLine = log.replace(/\(x\d+\)$/, '').trim(); // Remove count part from log line

        if (logMap[logLine]) {
          logMap[logLine] += count;
        } else {
          logMap[logLine] = count;
        }
      });

      return Object.entries(logMap).map(([log, count]) => ({ log, count }));
    };

    const columns = [
      {
        title: 'Log',
        dataIndex: 'log',
        key: 'log',
        width: '90%', // 85% width for log column
        render: (text) => (
          <div
            style={{
              whiteSpace: wrapLines ? 'normal' : 'nowrap', // Disable wrap if wrapLines is false
              overflow: 'hidden', // Hide overflow
              //textOverflow: 'ellipsis', // Show ellipsis when overflowing
              maxWidth: '100%', // Ensure it doesn't exceed column width
              display: 'inline-block', // To respect the maxWidth
              overflowX: wrapLines ? 'visible' : 'auto', // Enable scrolling for unwrapped lines
            }}
          >
            {text}
          </div>
        ),
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
        width: '10%', // 15% width for count column
        sorter: (a, b) => a.count - b.count, // Allow sorting by count
      },
    ];
    

    return (
      <Card
        title="Result"
        bordered={true}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        actions={[
          <span key="original">Original Logs: {rawLogsLen} {dualServiceCompare ? ' | '+rawLogs2Len : ''}</span>,
          <span key="reduced">Reduced Logs: {reducedLogsLen} {dualServiceCompare ? ' | '+reducedLogs2Len : ''}</span>,
          <span key="reduced">Reduction Rate: { Math.round((((reducedLogsLen / rawLogsLen) * 100) + Number.EPSILON) * 100) / 100 } {dualServiceCompare ? ' | '+(Math.round((((reducedLogs2Len / rawLogs2Len) * 100) + Number.EPSILON) * 100) / 100) : ''} %</span>,
          <a className='zoom' href={grafanaUrl} target="_blank" rel="noopener noreferrer">
            <span key="grafana">View Raw Logs</span>
          </a>
        ]}
      >
        {/* Log search */}
        <Form.Item 
          style={{ position: 'absolute', top: '10px', right: '100px' }}
          >
          <Input 
            prefix={<SearchOutlined />}
            placeholder="Search logs..." 
            onChange={(e) => handleSearch(e.target.value)} 
          />
        </Form.Item>

        <Button
          type="primary"
          onClick={toggleFullScreen}
          icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          style={{ position: 'absolute', top: '10px', right: '50px' }}
          className={'zoom'}
        />

        <Button
          className='zoom'
          type="primary"
          icon={<DownloadOutlined />}
          style={{ position: 'absolute', top: '10px', right: '10px' }}
          onClick={handleDownload}
        />

        {/* Toggle Table vs Log View */}
        <Space 
          size="middle" 
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}
        >
          <Space size="middle" style={{ flexGrow: 1 }}>
            {/* Log type filter */}
            <Radio.Group value={showOnly} onChange={(e) => setShowOnly(e.target.value)}>
              <Radio.Button className='zoom' value="" style={{ backgroundColor: showOnly === '' ? '#1890ff' : '', color: showOnly === '' ? '#fff' : '' }}>all</Radio.Button>
              <Radio.Button className='zoom' value="info" style={{ backgroundColor: showOnly === 'info' ? '#1890ff' : '', color: showOnly === 'info' ? '#fff' : '' }}>info</Radio.Button>
              <Radio.Button className='zoom' value="warn" style={{ backgroundColor: showOnly === 'warn' ? '#faad14' : '', color: showOnly === 'warn' ? '#fff' : '' }}>warn</Radio.Button>
              <Radio.Button className='zoom' value="error" style={{ backgroundColor: showOnly === 'error' ? '#ff4d4f' : '', color: showOnly === 'error' ? '#fff' : '' }}>error</Radio.Button>
            </Radio.Group>

            {/* Wrap lines toggle */}
            <Radio.Group>
              <Radio.Button className='zoom' style={{ backgroundColor: wrapLines ? '#1890ff' : '', color: wrapLines ? '#fff' : '' }} onClick={() => setWrapLines(!wrapLines)}>wrap</Radio.Button>
            </Radio.Group>

            {/* Show Table Toggle */}
            <Radio.Group>
              <Radio.Button className='zoom' style={{ backgroundColor: showTable ? '#1890ff' : '', color: showTable ? '#fff' : '' }} onClick={() => setShowTable(!showTable)}>table</Radio.Button>
            </Radio.Group>

          </Space>

          <Button
            type="secondary"
            onClick={() => carouselRef.current.goTo(1)}
            icon={<DoubleRightOutlined />}
            className={`zoom ${animateButton ? 'glow-button' : ''}`}
          >
            Logrctx AI
          </Button>
        </Space>


          <Collapse accordion bordered={false} defaultActiveKey={1}>
            <Collapse.Panel header={form.getFieldValue('service_name') ? form.getFieldValue('service_name') : "Service Logs"} key="1">
            {/* Conditionally Render Logs or Table */}
              {showTable ? (
                <Table
                  columns={columns}
                  dataSource={parseLogCount(filteredLogs)}
                  pagination={false}
                  rowKey="log"
                  scroll={{ y: 400 }}
                />
              ) : (
              <div
                style={{
                  maxHeight: isFullScreen ? '1000px' : '550px',
                  minHeight: '200px',
                  overflowY: 'scroll',
                  padding: '16px',
                  backgroundColor: '#282a36',
                  borderRadius: '8px',
                }}
              >
                <SyntaxHighlighter 
                  language="json" 
                  style={dracula} 
                  showLineNumbers
                  wrapLines={wrapLines}
                  lineProps={{style: {whiteSpace: 'pre-wrap'}}}
                  codeTagProps={{style: {fontSize: '12px'}}}
                >
                  {filteredLogs.length 
                    ? filteredLogs.map((log) => 
                        JSON.stringify(
                          log,
                          null,
                          2
                        )
                      ).join('\n') 
                    : 'No logs found :)'
                  }
                </SyntaxHighlighter>
              </div>
              )}
            </Collapse.Panel>

            {logs2.length > 0 && (
            <Collapse.Panel bordered={false} header={form.getFieldValue('service_2_name') ? form.getFieldValue('service_2_name') : "Service 2 Logs"} key="2">
              {showTable ? (
                <Table
                  columns={columns}
                  dataSource={parseLogCount(filteredLogs2)}
                  pagination={false}
                  rowKey="log"
                  scroll={{ y: 400 }}
                />
              ) : (
              <div
                style={{
                  marginTop: '20px',
                  maxHeight: isFullScreen ? '1000px' : '550px',
                  minHeight: '200px',
                  overflowY: 'scroll',
                  padding: '16px',
                  backgroundColor: '#282a36',
                  borderRadius: '8px',
                }}
              >
                <SyntaxHighlighter 
                  language="json" 
                  style={dracula} 
                  showLineNumbers
                  wrapLines={wrapLines}
                  lineProps={{style: {whiteSpace: 'pre-wrap'}}}
                  codeTagProps={{style: {fontSize: '12px'}}}
                >
                  {filteredLogs2.length 
                    ? filteredLogs2.map((log) => 
                        JSON.stringify(
                          log,
                          null,
                          2
                        )
                      ).join('\n') 
                    : 'No logs found :)'
                  }
                </SyntaxHighlighter>
              </div>
              )}
            </Collapse.Panel>
            )}
          </Collapse>
        
      </Card>
  );
};

export default LogsDisplaySection;