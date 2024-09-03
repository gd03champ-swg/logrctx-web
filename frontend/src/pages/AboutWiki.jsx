import React from 'react';
import { Typography, Collapse, Card, Row, Col, Image, Space, Alert, Button, Anchor, Divider, Timeline, Tooltip } from 'antd';
import { InfoCircleOutlined, FilterOutlined, RocketOutlined, ExperimentOutlined, WarningOutlined, ExclamationCircleOutlined, ThunderboltOutlined, FilePdfOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Link } = Anchor;

import logo from '../assets/logo.png';

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
                  <br/><h4>Welcome to <strong>Logrctx</strong> – Context-aware Log Reduce and Analysis.</h4> <br/> This tool is designed to help you manage and analyze large log datasets efficiently.
                  By leveraging intelligent log draining, powerful AI-driven analysis, and contextual understanding, Logrctx offers a comprehensive solution for log management.
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
               {/* <Image 
                  src="/assets/moto-image.png" 
                  alt="Mission Image"
                  width="100%"
                  style={{ marginBottom: '20px', borderRadius: '12px' }}
                />*/}
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
                  Logrctx uses a powerful <Text strong>Log Draining</Text> technique to reduce logs effectively. Log Draining works by clustering logs into templates and compressing them into a single line, 
                  maintaining the contextual data while significantly reducing the log volume.
                </Paragraph>
                <Collapse>
                  <Panel header="Learn more about Log Draining" key="1">
                    <Paragraph>
                      Log Draining is a technique that parses logs into tree structures and clusters them. Each cluster is compressed into a single log line that includes all variables of the template,
                      ensuring that essential information is retained. This technique helps in managing large datasets efficiently by reducing redundancy.
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
                  The AI analysis feature in Logrctx is built on a custom <Text strong>RAG (Retrieval-Augmented Generation)</Text> pipeline, utilizing cosine similarity and semantic embeddings. 
                  This ensures faster, context-aware responses that are tailored to your logs and queries.
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
                  Filters (e.g., error, warn, info) are essential for optimizing AI analysis. By narrowing down the logs passed to the AI, you can achieve faster and more accurate results.
                  Make sure to apply filters before running any AI analysis.
                </Paragraph>
              </div>

              <Divider />

              {/* Reduction Rate Section */}
              <div id="reduction-rate">
                <Title level={2}>
                  <ThunderboltOutlined /> Understanding the Reduction Rate
                </Title>
                <Paragraph>
                  The input reduction rate in Logrctx serves as the <Text strong>upper limit</Text> for log reduction. The actual reduction rate depends on the repetitiveness of the logs.
                  Although the reduction rate may vary, it will never exceed the specified limit.
                </Paragraph>
                <Collapse>
                  <Panel header="Why is the achieved reduction rate lower?" key="1">
                    <Paragraph>
                      The achieved reduction rate is determined by the repetitiveness of the logs. While the input rate sets an upper bound, the actual reduction depends on the data's characteristics.
                      Highly repetitive logs may result in a lower reduction rate, but this ensures that important information is not lost.
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
                  Logrctx retrieves only the first 5000 log lines from the selected start time. To ensure precise analysis, select a narrower time range that aligns with the specific logs you wish to analyze.
                  This limitation is due to the Loki API constraints, so please be mindful when setting the time range.
                </Paragraph>
              </div>

              <Divider />

              {/* AI Quota Section */}
              <div id="ai-quota">
                <Title level={2}>
                  <WarningOutlined /> AI Quota and Usage Limits
                </Title>
                <Paragraph>
                  To prevent misuse and manage operational costs, each user is limited to <Text strong>5 AI analyses per 5 minutes</Text>. This quota resets dynamically, allowing you to monitor and manage your usage effectively.
                  You can track your quota status in the Logrctx AI section.
                </Paragraph>
              </div>

              <Divider />

              {/* Release Notes Section */}
              <div id="release-notes">
                <Title level={2}>
                  <HistoryOutlined /> Release Notes
                </Title>
                <Timeline>
                  <Timeline.Item>
                    <Text strong>Version 2.1.0</Text> - Introduced AI-powered log analysis with RAG pipeline and semantic search.
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Version 2.0.0</Text> - Added log filtering capabilities for faster analysis and improved accuracy.
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>Version 1.5.0</Text> - Enhanced log draining mechanism to handle larger datasets more efficiently.
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
