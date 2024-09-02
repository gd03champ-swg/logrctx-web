// LogReducer.jsx
import React,{ useState, useEffect, useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Form, Button, DatePicker, Select, Space, Card, notification, Spin, Modal, Breadcrumb } from 'antd';
import { Input, Collapse, InputNumber, Radio, Typography, Carousel, Skeleton, Divider } from 'antd';
const { Text, Link, Paragraph } = Typography;
import { DoubleRightOutlined, DoubleLeftOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { AlignCenterOutlined, AliwangwangOutlined, DownloadOutlined, InfoCircleOutlined, SearchOutlined} from '@ant-design/icons';
import Markdown from 'react-markdown'

import dayjs from 'dayjs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { service_pod_mapping, all_pods } from '../data/data.js';
import { fetchReducedLogs, fetchRAGSummary } from '../handlers/apiHandlers.js';

import { ReduceProgress, SummarizeProgress } from '../components/Progress.jsx';

import myLogo from '../assets/logo.png';
import myLogoName from '../assets/logo-name.png';

const { Option } = Select;

const Dashboard = () => {
  
  const [reductionRate, setReductionRate] = useState(15);
  
  const [logs, setLogs] = useState([]);
  const [llmResponse, setLlmResponse] = useState("");

  const [userPrompt, setUserPrompt] = useState("Summarize and bring up any anomalies in the logs")

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnly, setShowOnly] = useState('');
  const [rawLogsLen, setRawLogsLen] = useState(0);
  const [reducedLogsLen, setReducedLogsLen] = useState(0);
  const [wrapLines, setWrapLines] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  const [summariesCountInLast5Mins, setSummariesCountInLast5Mins] = useState(0);

  const [pods, setPods] = useState([]);
  const [services, setServices] = useState([]);

  const [grafanaUrl, setGrafanaUrl] = useState(null);


  /// UseStates for steps illustration : wait -> process -> finish
  const [fetch , setFetch] = useState('wait');
  const [reduce , setReduce] = useState('wait');
  const [format , setFormat] = useState('wait');
  const [display , setDisplay] = useState('wait');
  ///

  const carouselRef = useRef();
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

  //useEffect to calculate usage quota for last 5 minutes from local storage
  useEffect(() => {
    const summaries = JSON.parse(localStorage.getItem('summaries')) || [];
    const last5Mins = dayjs().subtract(5, 'minutes');
    const summariesInLast5MinsHere = summaries.filter((summary) => dayjs(summary.timestamp, 'DD-MM-YYYY HH:mm:ss').isAfter(last5Mins));
    setSummariesCountInLast5Mins(summariesInLast5MinsHere.length);
  }, [llmResponse]);

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        (log.toLowerCase().includes(showOnly)) &&
        (!searchTerm || log.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [logs, showOnly, searchTerm]);  // Dependency array ensures recomputation only when needed

  // time range selection helpers
  const predefinedTimeRanges = [
    { label: 'Last 10 Minutes', value: 1 / 6 },
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

  const startSummary = async () => {
    setSummarizerLoading(true);

    if (logs.length === 0) {
      openNotification('info', 'No logs to summarize', 'Please fetch logs first');
      setSummarizerLoading(false); // Add this line to stop the loading state
      carouselRef.current.goTo(0); // Move carousel back to logs
      return;
    }

    if (!userPrompt) {
      openNotification('warning', 'No user prompt', 'Please enter a user prompt to summarize the logs');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }

    if (filteredLogs.length === 0) {
      openNotification('info', 'No logs to summarize', 'Please enter a valid search term');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }

    if (llmResponse !== "") {
      openNotification('info', 'Logs already summarized', 'Please fetch new logs to summarize');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }

    // Block if reached user quota
    if (summariesCountInLast5Mins >= 5) {
      openNotification('warning', 'Quota Exceeded', 'You have reached the maximum quota of 5 summaries in the last 5 minutes.');
      openNotification('info', 'Quota Exceeded', 'Please avoid spamming AI and try again after some time.');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }

    // Ask user to wait untill estimated time for summarization
    openNotification('info', 'Summarizing Logs', 'Please while we perform RAG with the logs...');

    // Move carousel to summary
    carouselRef.current.goTo(1);

    // Apply user selected filters
    const myLogs = filteredLogs.map((log) => 
          JSON.stringify(log.replace(/^\[\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\] /, ''), null, 2)
        ) 
    // 0.5 seconds per 2 log line
    const estimatedTime = Math.ceil(myLogs.length / 2) * 0.5;
    openNotification('info', 'Summarizing Logs', 'Estimated wait time is ' + estimatedTime + ' seconds');

    // Call the summarizer function and pass necessary parameters
    try{
      console.log('User Prompt:', userPrompt);
      console.log('Lenght of filtered logs:', myLogs.length);
      const data = await fetchRAGSummary(userPrompt, myLogs);
      if (!data.response) {
        throw new Error(data.message);
      }
      console.log('Response:', data.response);
      storeSummary(data.response);
      setLlmResponse(data.response);
      //writeLlmResponse(data.response);
      openNotification('success', 'Logs Summarized Successfully', 'The logs have been successfully summarized and displayed.');
    } catch (error) {
      console.log('Failed to summarize logs:', error);
      openNotification('error', 'Error Summarizing Logs', error.message || 'An error occurred while summarizing logs.');
    } finally {
    setSummarizerLoading(false);
    }
  };

  const storeSummary = (response) => {
    // Save summary along with request info to local storage array
    const summary = {
      pod: form.getFieldValue('pod_name'),
      service: form.getFieldValue('service_name'),
      timeRange: form.getFieldValue('time_range').map((time) => dayjs(time).format('DD-MM-YYYY HH:mm:ss')),
      userPrompt: userPrompt,
      response: response,
      timestamp: dayjs().format('DD-MM-YYYY HH:mm:ss'),
    };
    console.log('Summary Constructed:', summary);
    const summaries = JSON.parse(localStorage.getItem('summaries')) || [];
    summaries.push(summary);
    localStorage.setItem('summaries', JSON.stringify(summaries));
  };  

  const handleCopyClick = async (content) => {
    try {
        await window.navigator.clipboard.writeText(content);
        openNotification('success', 'Copied to clipboard', 'The response has been copied to clipboard.');
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        openNotification('error', 'Copy to clipboard failed', err.message || 'An error occurred while copying to clipboard');
    }
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

  const onFinish = async (values) => {
    setLoading(true);

    // Move carousel to summary
    carouselRef.current.goTo(0);

    // Reset the LLM response
    setLlmResponse("");
    
    /// Steps update
    setFetch('process');
    setReduce('wait');
    setFormat('wait');
    setDisplay('wait');
    ///

    // Steps update -> wait for random 3-6 seconds and update the steps if loading is still true
    setTimeout(() => {
      setLoading((loadingState) => {
        if (loadingState) {
          setFetch('finish');
          setReduce('process');
          setFormat('wait');
          setDisplay('wait');
        }
        return loadingState; // Ensure loading state is returned as is
      });
    }, Math.floor(Math.random() * (4000 - 1500) + 1500));
    ///

    try {
      // Call the fetchReducedLogs function and pass necessary parameters
      const data = await fetchReducedLogs(values, reductionRate);
  
      console.log('Response:', data.message);

      if (!data.reduced_logs) {
        openNotification('warning', 'An error occured at backend!', data.message);
        setLoading(false);

        /// Steps update
        setFetch('wait');
        setReduce('wait');
        setFormat('wait');
        setDisplay('wait');

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

      /// Steps update
      setFetch('finish');
      setReduce('finish');
      setFormat('finish');
      setDisplay('finish');
      ///

      // Scroll to logs
      scrollToBottom();

      // Glow AI button for 5 seconds
      setTimeout(() => {
        setAnimateButton(true);
        // Reset the animation after 3 seconds
        setTimeout(() => setAnimateButton(false), 6000);
      }
      , 1500);

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

        /// Steps update
        setFetch('wait');
        setReduce('wait');
        setFormat('wait');
        setDisplay('wait');
        ///

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

  // Function to scroll to bottom
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    scrollToBottom();
    openNotification('info', 'Full Screen Mode', 'You have toggled full screen mode');
  };
  
  return (
    <div>

      {/* Progress bar */}
      <ReduceProgress fetch={fetch} reduce={reduce} format={format} display={display} />

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

        </Space>
      </Form>
      </Card>


      <Carousel 
        effect="scrollx"
        style={{
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          width: '100%', 
          position: 'relative', // Ensure positioning does not affect arrows
        }}
        ref={carouselRef} 
        dots={true}
        dotPosition='bottom'
        arrows={true}
        adaptiveHeight={true}
        draggable={true}
        infinite={false}
        >

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
            <span  key="original">Original Logs: {rawLogsLen}</span>,
            <span key="reduced">Reduced Logs: {reducedLogsLen}</span>,
            <span key="reduced">Reduction Rate: { Math.round((((reducedLogsLen / rawLogsLen) * 100) + Number.EPSILON) * 100) / 100 } %</span>,
            <a className='zoom' href={grafanaUrl} target="_blank" rel="noopener noreferrer">
              <span key="grafana">View Raw Logs</span>
            </a>
          ]}
        >
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

          <div
            style={{
              maxHeight: isFullScreen ? '1000px' : '550px', // Set a fixed height
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


        </Card>

        <Card
          title="Logrctx AI"
          bordered={true}
          actions={[
            <span key="original">Original Logs: {rawLogsLen}</span>,
            <span key="reduced">Reduced Logs: {reducedLogsLen}</span>,
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

      </Carousel>
    </div>
  );
};

export default Dashboard;
