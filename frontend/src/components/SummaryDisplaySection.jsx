import React from 'react';
import { Card, Form, Button, Skeleton, Typography, Divider } from 'antd';
import { AliwangwangOutlined, DoubleLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
const { Paragraph, Text } = Typography

const SummaryDisplaySection = ({
    carouselRef,
    setUserPrompt,
    userPrompt,
    startSummary,
    summarizerLoading,
    llmResponse,
    handleCopyClick,
    grafanaUrl,
    rawLogsLen,
    reducedLogsLen,
    summariesCountInLast5Mins,
    dualServiceCompare,
    rawLogs2Len,
    reducedLogs2Len,
    grafanaUrl2

}) => {
    return (
        <Card
            title="Logrctx AI"
            bordered={true}
            actions={[
            <span  key="original">Original Logs: {rawLogsLen} {dualServiceCompare ? ' | '+rawLogs2Len : ''}</span>,
            <span key="reduced">Reduced Logs: {reducedLogsLen} {dualServiceCompare ? ' | '+reducedLogs2Len : ''}</span>,
            <span style={{color: summariesCountInLast5Mins>=5 ? 'red' : ''}} key="reduced">AI Quota: {summariesCountInLast5Mins}/5</span>,
            <a className='zoom' href={grafanaUrl} target="_blank" rel="noopener noreferrer">
                <span key="grafana">View Raw Logs</span>
            </a>
            ]}
            className='glow'
            style={{ position: 'relative' }}
        >
            {/* Back Button */}
            <Button
            className='zoom'
            type="secondary"
            icon={<DoubleLeftOutlined />}
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={() => carouselRef.current.goTo(0)}
            >
            Back
            </Button>

            {/* Get user prompt input */}
            <Form layout="inline">
            <Form.Item 
                label="Prompt: "
                style={{ flex: 1, marginRight: '10px' }}>
                <Paragraph
                style={{ width: '100%', marginBottom: 0 }}
                editable={{
                    onChange: setUserPrompt,
                }}
                >
                {userPrompt}
                </Paragraph>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
                <Button
                type="primary"
                onClick={startSummary}
                icon={<AliwangwangOutlined />}
                loading={summarizerLoading}
                className="fetch-logs-btn"
                >
                Analyze
                </Button>
            </Form.Item>
            </Form>


            {/* Skeleton Loader for LLM Response */}
            {summarizerLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} style={{marginTop: '15px'}} />
            ) : llmResponse ?(
            <Paragraph 
                style={{ marginTop: '10px' }}
                copyable={{
                tooltips: ['click to copy', 'Response copied!!'],
                text: async () =>
                    new Promise((resolve) => {
                    setTimeout( async () =>{
                        await handleCopyClick(llmResponse)
                        resolve(llmResponse);
                    }, 500);
                    }),
                }}
            >
                {llmResponse.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    <br />
                </React.Fragment>
                ))}
            </Paragraph>
            ) : (<p><br/>{"Nothing here yet :)"}</p>)
            }

            {/* Disclaimer about AI */}
            <Divider>
            <InfoCircleOutlined />
            </Divider>
            <Text type="secondary" style={{ display: 'block', marginTop: '20px', textAlign: 'center' }}>
            AI generated information may contain errors. Please verify important info. <br/>
            Any filter applied on reduced logs will reflect here too.
            </Text>

        </Card>
    );
    }

export default SummaryDisplaySection;