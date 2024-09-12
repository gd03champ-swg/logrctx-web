import React from 'react';
import { Typography, Collapse, Card, Row, Col, Space, Alert, Button, Anchor, Divider, Timeline, Tooltip } from 'antd';
import { InfoCircleOutlined, FilterOutlined, RocketOutlined, ExperimentOutlined, WarningOutlined, ExclamationCircleOutlined, ThunderboltOutlined, FilePdfOutlined, HistoryOutlined, ApiOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Link } = Anchor;

const AboutWiki = () => {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f2f5' }}>
      <Row gutter={[16, 16]}>
        {/* Anchor Links for Navigation */}
        <Col xs={24} sm={6}>
          <Card style={{ position: 'sticky', top: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Anchor affix={false} style={{ padding: '20px' }}>
              <Link href="#introduction" title="Introduction" />
              <Link href="#moto" title="Moto" />
              <Link href="#log-reduction" title="Log Reduction" />
              <Link href="#ai-analysis" title="AI Analysis" />
              <Link href="#filters" title="Applying Filters" />
              <Link href="#reduction-rate" title="Reduction Rate" />
              <Link href="#limits" title="Knowing Limits" />
              <Link href="#ai-quota" title="AI Quota" />
              <Link href="#api-usage" title="API Usage" />
              <Link href="#release-notes" title="Release Notes" />
            </Anchor>
          </Card>
        </Col>

        {/* Content Section */}
        <Col xs={24} sm={18}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Space direction="vertical" size="large">

              {/* Introduction Section */}
              <div id="introduction">
                <Title level={2}>
                  <RocketOutlined /> Welcome to Logrctx
                </Title>
                <Paragraph>
                  <h4>Welcome to <strong>Logrctx</strong> – Context-aware Log Reduce and Analysis.</h4> This tool helps you manage and analyze large log datasets efficiently. By leveraging intelligent log draining, powerful AI-driven analysis, and contextual understanding, Logrctx offers a comprehensive solution for log management.
                </Paragraph>
              </div>

              <Divider />

              {/* Moto Section */}
              <div id="moto">
                <Title level={2}>
                  <RocketOutlined /> Our Moto
                </Title>
                <Paragraph>
                  Our mission is to simplify the complexities of log management and empower users with intelligent tools that reduce and analyze logs with context-aware precision.
                </Paragraph>
              </div>

              <Divider />

              {/* Log Reduction Section */}
              <div id="log-reduction">
                <Title level={2}>
                  <FilterOutlined /> Log Reduction with Log Draining
                  <Tooltip title="Learn more about Log Draining">
                    <a href="https://www.semanticscholar.org/paper/Drain%3A-An-Online-Log-Parsing-Approach-with-Fixed-He-Zhu/6c0867762a8c64daa8a07133d1fe9f4ff59621c6" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>
                      <FilePdfOutlined />
                    </a>
                  </Tooltip>
                </Title>
                <Paragraph>
                  Logrctx uses a powerful <Text strong>Log Draining</Text> technique to reduce logs effectively. Log Draining clusters logs into templates and compresses them into a single line while maintaining contextual data, significantly reducing log volume.
                </Paragraph>
                <Collapse>
                  <Panel header="Learn more about Log Draining" key="1">
                    <Paragraph>
                      Log Draining parses logs into tree structures and clusters them. Each cluster is compressed into a single log line that includes all template variables, ensuring that important information is retained.
                    </Paragraph>
                  </Panel>
                </Collapse>
              </div>

              <Divider />

              {/* AI Analysis Section */}
              <div id="ai-analysis">
                <Title level={2}>
                  <ExperimentOutlined /> AI-Powered Log Analysis
                </Title>
                <Paragraph>
                  The AI analysis feature in Logrctx is built on a custom <Text strong>RAG (Retrieval-Augmented Generation)</Text> pipeline using cosine similarity and semantic embeddings. This ensures fast, context-aware responses tailored to your logs and queries.
                </Paragraph>
                <Alert
                  message="Tip"
                  description="Apply filters before running AI analysis for better performance and accuracy."
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
              </div>

              <Divider />

              {/* Applying Filters Section */}
              <div id="filters">
                <Title level={2}>
                  <FilterOutlined /> Importance of Applying Filters
                </Title>
                <Paragraph>
                  Filters (e.g., error, warn, info) optimize AI analysis by narrowing the logs passed to the AI, resulting in faster, more accurate results. Apply filters before running any AI analysis.
                </Paragraph>
              </div>

              <Divider />

              {/* Reduction Rate Section */}
              <div id="reduction-rate">
                <Title level={2}>
                  <ThunderboltOutlined /> Understanding the Reduction Rate
                </Title>
                <Paragraph>
                  The input reduction rate in Logrctx is the <Text strong>upper limit</Text> for log reduction. The actual reduction rate depends on log repetitiveness. The reduction rate may vary, but it will never exceed the specified limit.
                </Paragraph>
                <Collapse>
                  <Panel header="Why is the achieved reduction rate lower?" key="1">
                    <Paragraph>
                      The achieved reduction rate depends on log repetitiveness. Highly repetitive logs result in lower reduction rates, ensuring that important information is retained.
                    </Paragraph>
                  </Panel>
                </Collapse>
              </div>

              <Divider />

              {/* Knowing Limits Section */}
              <div id="limits">
                <Title level={2}>
                  <ExclamationCircleOutlined /> Knowing the Limits
                </Title>
                <Paragraph>
                  Logrctx retrieves the first 10,000 log lines from the selected start time. For precise analysis, select a narrower time range that aligns with the logs you want to analyze.
                </Paragraph>
              </div>

              <Divider />

              {/* AI Quota Section */}
              <div id="ai-quota">
                <Title level={2}>
                  <WarningOutlined /> AI Quota and Usage Limits
                </Title>
                <Paragraph>
                  Each user is limited to <Text strong>5 AI analyses per 5 minutes</Text>. This quota resets dynamically, allowing you to monitor and manage your usage.
                </Paragraph>
              </div>

              <Divider />

              {/* API Usage Section */}
              <div id="api-usage">
                <Title level={2}>
                  <ApiOutlined /> API Usage
                </Title>
                <Paragraph>
                  Logrctx provides a REST API for automating log reduction and AI analysis. Below are the available endpoints:
                </Paragraph>

                {/* API Endpoints Details */}

                <Alert
                  message="API URL"
                  description={<Text code>https://logrctx-api.swiggyops.de</Text>}
                  type="success"
                  showIcon
                  style={{ marginBottom: '20px' }}
                />

                <Collapse>
                  <Panel header="Log Reduction API: /reduce" key="1">
                    <Paragraph>
                      <Text code>POST</Text> <Text strong>/reduce</Text> - This endpoint reduces logs using Log Draining. Send a JSON payload containing the service name, start time, end time, and reduction rate.
                    </Paragraph>
                    <Alert
                      message="Payload Example"
                      description={
                        <pre>
                          {`{
  "service_name": "service_1",
  "start_time": "01-09-2024 00:00:00",
  "end_time": "01-09-2024 12:00:00",
  "reduction_rate": 15 ,
}`}
                        </pre>
                      }
                      type="info"
                      showIcon
                    />
                  </Panel>
                  <Panel header="AI RAG Analysis API: /rag" key="2">
                    <Paragraph>
                      <Text code>POST</Text> <Text strong>/rag</Text> - This endpoint generates AI-based log summaries using a custom RAG pipeline. Provide the logs and a query for the analysis.
                    </Paragraph>
                    <Alert
                      message="Payload Example"
                      description={
                        <pre>
                          {`{
  "logs": ["log 1", "log 2"],
  "query": "Summarize anomalies"
}`}
                        </pre>
                      }
                      type="info"
                      showIcon
                    />
                  </Panel>
                  <Panel header="Comparative AI RAG API: /rag-comparitive" key="3">
                    <Paragraph>
                      <Text code>POST</Text> <Text strong>/rag-comparitive</Text> - This endpoint compares two sets of logs based on a query and generates a comparative summary using the RAG pipeline.
                    </Paragraph>
                    <Alert
                      message="Payload Example"
                      description={
                        <pre>
                          {`{
  "logs_1": ["log1a", "log1b", "log1c"],
  "logs_2": ["log2a, "log2b", "log2c"],
  "query": "Compare anomalies"
}`}
                        </pre>
                      }
                      type="info"
                      showIcon
                    />
                  </Panel>
                </Collapse>

                {/* Instruction for using API token in Authorization header */}
                <Alert
                  message="API Authorization"
                  description="Include your generated API token in the Authorization header as a Bearer token. Example: Authorization: Bearer <your-api-token>"
                  type="info"
                  showIcon
                  style={{ marginTop: '20px' }}
                />
                
                {/* Button to navigate to token generation page */}
                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  href="/api-token" // Route to token generation page
                  style={{ marginTop: '20px' }}
                >
                  Generate API Token
                </Button>


              </div>

              <Divider />

              {/* Release Notes Section */}
              <div id="release-notes">
                <Title level={2}>
                  <HistoryOutlined /> Release Notes
                </Title>
                <Timeline>
                  <Timeline.Item>
                    <Text strong>Version 2.2.0</Text> - Added API support for log reduction and AI analysis.
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Version 2.1.0</Text> - Introduced AI-powered log analysis with RAG pipeline and semantic search.
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Version 2.0.0</Text> - Added log filtering capabilities for faster analysis.
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Version 1.0.0</Text> - Initial release with basic log reduction features.
                  </Timeline.Item>
                </Timeline>
              </div>

            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutWiki;
