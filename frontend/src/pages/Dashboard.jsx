// LogReducer.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Form, Button, DatePicker, Select, Space, Card, notification, Spin, Modal } from 'antd';
import { Input, Collapse, InputNumber, Radio, Divider, Typography } from 'antd';
const { Text, Link } = Typography;
import { AlignCenterOutlined, AliwangwangOutlined, DownloadOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { service_pod_mapping, all_pods } from '../data/data.js';
import { fetchReducedLogs } from '../handlers/apiHandlers.js';

import myLogo from '../assets/logo.png';
import myLogoName from '../assets/logo-name.png';

const { Option } = Select;

const Dashboard = () => {
  
  const [reductionRate, setReductionRate] = useState(15);
  
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnly, setShowOnly] = useState('');
  const [rawLogsLen, setRawLogsLen] = useState(0);
  const [reducedLogsLen, setReducedLogsLen] = useState(0);
  const [wrapLines, setWrapLines] = useState(true);

  const [loading, setLoading] = useState(false);
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [pods, setPods] = useState([]);
  const [services, setServices] = useState([]);

  const [grafanaUrl, setGrafanaUrl] = useState(null);

  const [form] = Form.useForm();

  // Global flag to ensure the banner is shown only once
  let bannerShown = localStorage.getItem('bannerShown') || false; // Check if the banner has been shown

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setPods(all_pods);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  
    if (!bannerShown) { // Check if the banner has been shown
      bannerShown = true; // Set the flag to true after showing the banner
      localStorage.setItem('bannerShown', bannerShown); // Store the flag in local storage
      Modal.info({
        title: 'Beta Testing',
        content: (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <img src={myLogo} alt="logrctx logo" style={{ width: '120px' }} />
              <img src={myLogoName} alt="logrctx name logo" style={{ width: '120px', marginBottom: '10px' }} />
              <Text>This is a beta version of Logrctx. We are still in early stages of development.</Text>
              <Text>
                Ping <Link href='https://swiggy.enterprise.slack.com/archives/D071E3Q7U3G'>@GD</Link> for any feedback or feature requests.
              </Text>
            </Space>
          </div>
        ),
        onOk() {},
      });
    }
  
  }, []);


  // time range selection helpers

  const predefinedTimeRanges = [
    { label: 'Last 1 Hour', value: 1 },
    { label: 'Last 3 Hours', value: 3 },
    { label: 'Last 6 Hours', value: 6 },
    { label: 'Last 12 Hours', value: 12 },
    { label: 'Last 24 Hours', value: 24 },
  ];

  const handlePredefinedTimeRange = (value) => {
    const endTime = dayjs();
    const startTime = endTime.subtract(value, 'hours');
    form.setFieldsValue({ time_range: [startTime, endTime] });
  };  

  // Add debounce to search input
  const handleSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []  // Empty array ensures debounce function is not recreated on every render
  );

  const startSummary = () => {
    setSummarizerLoading(true);
    if (logs.length === 0) {
      openNotification('info', 'No logs to summarize', 'Please fetch logs first');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }
    openNotification('success', 'Under Construction 🛠️', 'LLM RAG based summary is being implemented actively. Check back later');
    setSummarizerLoading(false);
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  const onValueChange = (value) => {
    console.log("pod changed: ", value);
    if (value in service_pod_mapping){
        setServices(service_pod_mapping[value]);
    } else {
        setServices([]);
        openNotification('info', 'No services for this pod', 'Please select any other pod');
    }
  };
    

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        (log.toLowerCase().includes(showOnly)) &&
        (!searchTerm || log.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [logs, showOnly, searchTerm]);  // Dependency array ensures recomputation only when needed
    

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Call the fetchReducedLogs function and pass necessary parameters
      const data = await fetchReducedLogs(values, reductionRate);
  
      console.log('Response:', data.message);

      if (!data.reduced_logs) {
        openNotification('warning', 'An error occured at backend!', data.message);
        setLoading(false);
        return;
      }
  
      const myReducedLogs = [];
      data.reduced_logs.forEach((log) => {
        const logObj = log.replace(/["']/g, '');
        myReducedLogs.push(logObj);
      });
  
      setLogs(myReducedLogs);
      setRawLogsLen(data.original_len);
      setReducedLogsLen(data.reduced_len);
  
      // Inform users if raw logs are capped at 5000
      if (data.original_len === 5000) {
        openNotification('warning', 'Logs Capped', 'The raw logs have been capped at 5000 from start time.');
      }
  
      // Construct Grafana URL
      const constructedGrafanaUrl = constructGrafanaUrl(
        values.time_range, 
        values.pod_name, 
        values.service_name
      );
      setGrafanaUrl(constructedGrafanaUrl);  // Set the Grafana URL in state
  
      openNotification('success', 'Logs Reduced Successfully', 'The logs have been successfully reduced and displayed.');
    } catch (error) {

        // Custom error for network error
        if (error.message === 'Network Error') {
          openNotification('error', 'Network Error', 'Couldn\'t connect to the backend. Please check your internet connection.');
          return;
        }

        // Custom error for 403
        if (error.response.status === 403) {
          openNotification('error', 'Unauthorized', 'You are not authorized to access this resource.');
          return;
        }

        console.log('Failed to fetch logs:', error);
        openNotification('error', 'Error Fetching Logs', error.message || 'An error occurred while fetching logs.');
      } finally {
        setLoading(false);
      }
  };
  

  const constructGrafanaUrl = (time_range, pod, service) => {
    const from = dayjs(time_range[0]).valueOf(); // Milliseconds since epoch
    const to = dayjs(time_range[1]).valueOf();
    const constructedGrafanaUrl = `https://logman.swiggyops.de/d/mkqRUh-Mk/service-logs?orgId=1&var-Pod=${pod}&var-service=${service}&var-search=&var-AND=&from=${from}&to=${to}&viewPanel=2`;
    return constructedGrafanaUrl;
  }

  // Function to handle the download
  const handleDownload = () => {

    if (logs.length === 0) {
      openNotification('info', 'No logs to download', 'Please fetch some logs');
      return;
    }

    // Create a Blob with the logs data
    const blob = new Blob([logs], { type: "text/plain" });
    // Create a link element and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = pod_name + "_" + service_name + "_logrctx_logs.log";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Free up the URL resource
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Card
        title="Log Reducer"
        style={{
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '100%', 
        }}
        bordered={true}
      >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          pod_name: '',
          service_name: '',
          reduction_rate: 15,
        }}
        style={{ maxWidth: '800px', margin: 'auto' }}
      >
        {/* Selector space */}
        <Space size="middle" style={{ display: 'flex' }}>

          {/*Pod select*/}
          <Form.Item
            label="Pod"
            name="pod_name"
            rules={[{ required: true, message: 'Please select the Pod Name!' }]}
            style={{ flex: 1 , minWidth: '150px'}}
          >
            <Select
              placeholder="Select Pod"
              className="custom-select"
              onChange={onValueChange}
              showSearch  // Add showSearch prop to enable search functionality
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }  // Add filterOption prop to customize search behavior
            >
              {pods.map((pod) => (
                <Option key={pod} value={pod}>
                  {pod}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/*Service name select*/}
          <Form.Item
            label="Service Name"
            name="service_name"
            rules={[{ required: true, message: 'Please select the Service Name!' }]}
            style={{ flex: 1, minWidth: '200px'}}
          >
            <Select 
              placeholder="Select Service" 
              className="custom-select"
              showSearch  // Add showSearch prop to enable search functionality
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }  // Add filterOption prop to customize search behavior
            >
              {services.map((service) => (
                <Option key={service} value={service}>
                  {service}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/*Time Range select*/}
          <Form.Item
          label="Time Range"
          name="time_range"
          rules={[{ required: true, message: 'Please select the time range!' }]}
          >
          <DatePicker.RangePicker
            showTime
            format="DD-MM HH:mm"
            style={{ width: '100%' }}
            className="custom-date-picker"
          />
          </Form.Item>

        </Space>

        {/* More Options Collapse */}
        <Collapse style={{ marginTop: '20px', marginBottom: '25px' }} defaultActiveKey={1}>
            <Collapse.Panel header="More Options" key="1">

              {/* Reduction Rate Input */}
              <Form.Item
                label="Reduction Rate (%)"
                name="reduction_rate"
                rules={[{ required: true, type: 'number', min: 5, max: 95, message: 'Please enter a valid reduction rate between 5 and 95!' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="reduction rate"
                  style={{ width: '100%' }}
                  value={reductionRate}
                  onChange={(value) => setReductionRate(value)}
                />
              </Form.Item>

              {/* Add Predefined Time Range Buttons */}
              <Form.Item label="Quick Time Range Selection">
                <Button.Group>
                  {predefinedTimeRanges.map(({ label, value }) => (
                    <Button className='zoom' key={value} onClick={() => handlePredefinedTimeRange(value)}>
                      {label}
                    </Button>
                  ))}
                </Button.Group>
              </Form.Item>
            </Collapse.Panel>
          </Collapse>

        <Space size="middle" style={{ display: 'flex' }}>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<AlignCenterOutlined />}
              loading={loading}
              block
              className="fetch-logs-btn"
            >
              {loading ? <Spin /> : 'Reduce Logs'}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={startSummary}
              icon={<AliwangwangOutlined />}
              loading={summarizerLoading}
              block
              className="fetch-logs-btn"
            >
              {loading ? <Spin /> : 'Summarize'}
            </Button>
          </Form.Item>
        </Space>
      </Form>
      </Card>


      <Card
        title="Result"
        style={{
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '100%', 
        }}
        bordered={true}
        actions={[
          <span  key="original">Original Logs: {rawLogsLen}</span>,
          <span key="reduced">Reduced Logs: {reducedLogsLen}</span>,
          <span key="reduced">Reduction Rate: { Math.round((((reducedLogsLen / rawLogsLen) * 100) + Number.EPSILON) * 100) / 100 } %</span>,
          <a className='zoom' href={grafanaUrl} target="_blank" rel="noopener noreferrer">
            <span key="grafana">View Raw Logs</span>
          </a>
        ]}
      >
        <Form.Item 
          label="Search Logs"
          style={{ position: 'absolute', top: '10px', right: '50px' }}
          >
          <Input 
            placeholder="Search logs..." 
            onChange={(e) => handleSearch(e.target.value)} 
          />
        </Form.Item>

        <Button
        className='zoom'
        type="primary"
        icon={<DownloadOutlined />}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
        onClick={handleDownload}
        />

        <Space size="middle" style={{ display: 'flex', marginBottom: '20px' }}>
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
          <Radio.Group>
            <Radio.Button 
                value="" 
                className='zoom'
                style={{ 
                  backgroundColor: wrapLines ? '#1890ff' : '', 
                  color: wrapLines ? '#fff' : '' 
                }}
                onClick={() => setWrapLines(!wrapLines) }
              >
                wrap
            </Radio.Button>
          </Radio.Group>


        </Space>
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
                JSON.stringify(log.replace(/^\[\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\] /, ''), null, 2)
              ).join('\n') 
            : 'No logs found :)'
          }
        </SyntaxHighlighter>


      </Card>
    </div>
  );
};

export default Dashboard;
