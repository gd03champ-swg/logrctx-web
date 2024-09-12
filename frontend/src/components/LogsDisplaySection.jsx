import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, Radio, Collapse, Space } from 'antd';
import { SearchOutlined, FullscreenOutlined, FullscreenExitOutlined, DownloadOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const LogsDisplaySection = ({
        form,
        rawLogsLen,
        reducedLogsLen,
        filteredLogs,
        showOnly,
        setShowOnly,
        wrapLines,
        setWrapLines,
        isFullScreen,
        toggleFullScreen,
        handleSearch,
        handleDownload,
        animateButton,
        carouselRef,
        logs2,
        rawLogs2Len,
        reducedLogs2Len,
        filteredLogs2,
        dualServiceCompare,
        grafanaUrl,
        grafanaUrl2
    }) => {
    return (
        <Card
          title="Result"
          bordered={true}
          // Style to make this card become full screen
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          actions={[
            <span  key="original">Original Logs: {rawLogsLen} {dualServiceCompare ? ' | '+rawLogs2Len : ''}</span>,
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

          {/* Logs display zone */}
          <Space 
            size="middle" 
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}
          >
            <Space size="middle" style={{ flexGrow: 1 }}>

              {/* Log type filter */}
              <Radio.Group value={showOnly} onChange={(e) => setShowOnly(e.target.value)}>
                <Radio.Button
                  className='zoom'
                  value="" 
                  style={{ 
                    backgroundColor: showOnly === '' ? '#1890ff' : '', 
                    color: showOnly === '' ? '#fff' : '' 
                  }}
                >
                  all
                </Radio.Button>
                <Radio.Button 
                  value="info" 
                  className='zoom'
                  style={{ 
                    backgroundColor: showOnly === 'info' ? '#1890ff' : '', 
                    color: showOnly === 'info' ? '#fff' : '' 
                  }}
                >
                  info
                </Radio.Button>
                <Radio.Button 
                  value="warn" 
                  className='zoom'
                  style={{ 
                    backgroundColor: showOnly === 'warn' ? '#faad14' : '', 
                    color: showOnly === 'warn' ? '#fff' : '' 
                  }}
                >
                  warn
                </Radio.Button>
                <Radio.Button 
                  value="error" 
                  className='zoom'
                  style={{ 
                    backgroundColor: showOnly === 'error' ? '#ff4d4f' : '', 
                    color: showOnly === 'error' ? '#fff' : '' 
                  }}
                >
                  error
                </Radio.Button>
              </Radio.Group>

              {/* Wrap lines toggle */}
              <Radio.Group>
                <Radio.Button 
                  value="" 
                  className='zoom'
                  style={{ 
                    backgroundColor: wrapLines ? '#1890ff' : '', 
                    color: wrapLines ? '#fff' : '' 
                  }}
                  onClick={() => setWrapLines(!wrapLines)}
                >
                  wrap
                </Radio.Button>
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

          <Collapse accordion defaultActiveKey={1}>
            <Collapse.Panel header={form.getFieldValue('service_name') ? form.getFieldValue('service_name') : "Service Logs"} key="1">
              <div
                style={{
                  maxHeight: isFullScreen ? '1000px' : '550px', // Set a fixed height
                  minHeight: '200px', // Set a minimum height
                  overflowY: 'scroll', // Enable scrolling within the div
                  padding: '16px',
                  backgroundColor: '#282a36', // Background color to match SyntaxHighlighter
                  borderRadius: '8px',
                }}
              >
                <SyntaxHighlighter 
                  language="json" 
                  style={dracula} 
                  showLineNumbers
                  wrapLines={wrapLines}
                  lineProps={{style: {whiteSpace: 'pre-wrap'}}}
                  codeTagProps={{style: {fontSize: '12px'}}}  // Adjust the font size here
                >
                  {filteredLogs.length 
                    ? filteredLogs.map((log) => 
                        JSON.stringify(
                          log
                            .replace(/^\[\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\] /, '') // Remove timestamp
                            .replace(/^"|"$/g, '')  // Remove leading and trailing double quotes
                            .replace(/\n/g, '')     // Remove newline characters
                            .replace(/\\/g, ''),    // Remove backslashes
                          null,
                          2
                        )
                      ).join('\n') 
                    : 'No logs found :)'
                  }
                </SyntaxHighlighter>
              </div>
            </Collapse.Panel>

            {logs2.length > 0 && (
            <Collapse.Panel header={form.getFieldValue('service_2_name') ? form.getFieldValue('service_2_name') : "Service 2 Logs"} key="2">
              <div
                style={{
                  marginTop: '20px',
                  maxHeight: isFullScreen ? '1000px' : '550px', // Set a fixed height
                  minHeight: '200px', // Set a minimum height
                  overflowY: 'scroll', // Enable scrolling within the div
                  padding: '16px',
                  backgroundColor: '#282a36', // Background color to match SyntaxHighlighter
                  borderRadius: '8px',
                }}
              >
                <SyntaxHighlighter 
                  language="json" 
                  style={dracula} 
                  showLineNumbers
                  wrapLines={wrapLines}
                  lineProps={{style: {whiteSpace: 'pre-wrap'}}}
                  codeTagProps={{style: {fontSize: '12px'}}}  // Adjust the font size here
                >
                  {filteredLogs2.length 
                    ? filteredLogs2.map((log) => 
                        JSON.stringify(
                          log
                            .replace(/^\[\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\] /, '') // Remove timestamp
                            .replace(/^"|"$/g, '')  // Remove leading and trailing double quotes
                            .replace(/\n/g, '')     // Remove newline characters
                            .replace(/\\/g, ''),    // Remove backslashes
                          null,
                          2
                        )
                      ).join('\n') 
                    : 'No logs found :)'
                  }
                </SyntaxHighlighter>
              </div>
            </Collapse.Panel>
            )}
          </Collapse>
        </Card>
    )
}

export default LogsDisplaySection;