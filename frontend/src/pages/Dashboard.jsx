// LogReducer.jsx
import React,{ useState, useEffect, useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Form, Select, Space, notification, Spin, Modal } from 'antd';
import { Typography, Carousel } from 'antd';
const { Text, Link } = Typography;

import dayjs from 'dayjs';

import { fetchReducedLogs, fetchRAGSummary, fetchComparitiveRAGSummary } from '../handlers/apiHandlers.js';

import { ReduceProgress } from '../components/Progress.jsx';

import myLogo from '../assets/logo.png';
import myLogoName from '../assets/logo-name.png';

import LogsDisplaySection from '../components/LogsDisplaySection.jsx';
import SummaryDisplaySection from '../components/SummaryDisplaySection.jsx';
import InputSection from '../components/InputsSection.jsx';
import { isError } from 'lodash';


const Dashboard = () => {
  
  const [reductionRate, setReductionRate] = useState(15);
  const [timeRange, setTimeRange] = useState([dayjs().subtract(5, 'minutes'), dayjs()]); // Default to last 5 minutes
  const [selectedQuickRange, setSelectedQuickRange] = useState(5/60); // Track selected quick time range
  const [userPrompt, setUserPrompt] = useState("Summarize and bring up any anomalies in the logs")
  const [errorLogsOnly, setErrorLogsOnly] = useState(false); // Track is error logs only retrieved

  const [logs, setLogs] = useState([]);
  const [logs2, setLogs2] = useState([]);

  const [llmResponse, setLlmResponse] = useState("");

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnly, setShowOnly] = useState('');
  const [rawLogsLen, setRawLogsLen] = useState(0);
  const [rawLogs2Len, setRawLogs2Len] = useState(0);
  const [reducedLogsLen, setReducedLogsLen] = useState(0);
  const [reducedLogs2Len, setReducedLogs2Len] = useState(0);
  const [wrapLines, setWrapLines] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  const [summariesCountInLast5Mins, setSummariesCountInLast5Mins] = useState(0);
  const [comparitiveSummariesCountInLast10Mins, setComparitiveSummariesCountInLast10Mins] = useState(0);
  
  const [grafanaUrl, setGrafanaUrl] = useState(null);
  const [grafanaUrl2, setGrafanaUrl2] = useState(null); // Though updated, not used for now

  const [dualServiceCompare, setDualServiceCompare] = useState(false);

  // UseStates for steps illustration : wait -> process -> finish
  const [fetch , setFetch] = useState('wait');
  const [reduce , setReduce] = useState('wait');
  const [format , setFormat] = useState('wait');
  const [display , setDisplay] = useState('wait');

  const carouselRef = useRef();
  const [form] = Form.useForm();
  

  // Global flag to ensure the banner is shown only once
  let bannerShown = localStorage.getItem('bannerShown') || false; // Check if the banner has been shown


  useEffect(() => {

    updateParamsFromUrl();
  
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
                Please read the <Link href='/about'>about page</Link> for more information on how to use the tool.
              </Text>
              <Text>
                Reach out to <Link href='https://swiggy.enterprise.slack.com/archives/C6P2C6938'>#devops-help</Link> for any feedback or feature requests.
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
    const last10Mins= dayjs().subtract(10, 'minutes')
    const summariesInLast5MinsHere = summaries.filter((summary) => dayjs(summary.timestamp, 'DD-MM-YYYY HH:mm:ss').isAfter(last5Mins));
    const comparitiveSummariesInLast10Mins = summaries.filter((summary) => dayjs(summary.timestamp, 'DD-MM-YYYY HH:mm:ss').isAfter(last10Mins) && summary.isDualService);
    setSummariesCountInLast5Mins(summariesInLast5MinsHere.length);
    setComparitiveSummariesCountInLast10Mins(comparitiveSummariesInLast10Mins.length);
  }, [llmResponse]);

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        (log.toLowerCase().includes(showOnly)) &&
        (!searchTerm || log.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [logs, showOnly, searchTerm]);  // Dependency array ensures recomputation only when needed

  const filteredLogs2 = useMemo(() => {
    return logs2
      .filter(log => 
        (log.toLowerCase().includes(showOnly)) &&
        (!searchTerm || log.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [logs2, showOnly, searchTerm]);  // Dependency array ensures recomputation only when needed


  // Update parameters from url embed
  const updateParamsFromUrl = () => {
    // Check URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const service_name = searchParams.get('service_name');
    const start_time = searchParams.get('start_time');
    const end_time = searchParams.get('end_time');

    if (service_name) {
      form.setFieldsValue({ service_name });
    }
    if (start_time && end_time) {
      const startTime = dayjs(start_time);
      const endTime = dayjs(end_time);
      setTimeRange([startTime, endTime]);
      form.setFieldsValue({ time_range: [startTime, endTime] });
    }
  }

  // Handle predefined time range selection
  const handlePredefinedTimeRange = (value) => {
    const endTime = dayjs();
    const startTime = endTime.subtract(value, 'hours');
    setTimeRange([startTime, endTime]);  // Update state
    setSelectedQuickRange(value);  // Highlight selected quick time range
    form.setFieldsValue({ time_range: [startTime, endTime] });  // Sync with form
  };

  // Handle manual time range selection (reset quick select highlight)
  const handleTimeRangeChange = (dates) => {
    setTimeRange(dates);
    setSelectedQuickRange(null);  // Reset quick select highlight
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

    // Check if logs are available
    if (logs.length === 0) {
      openNotification('warning', 'No logs to summarize', 'Please fetch logs to continue');
      setSummarizerLoading(false); // Add this line to stop the loading state
      carouselRef.current.goTo(0); // Move carousel back to logs
      return;
    }

    // Check if user prompt is available
    if (!userPrompt) {
      openNotification('warning', 'No user prompt', 'Please enter a user prompt to summarize the logs');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }

    // Check if logs are available with filters
    if (filteredLogs.length === 0) {
      openNotification('warning', 'No logs to summarize', 'Please enter a valid search term');
      setSummarizerLoading(false); // Add this line to stop the loading state
      return;
    }

    // Check if logs are already summarized
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

    // Block if reached user quota for comparitive summaries
    //if (comparitiveSummariesCountInLast10Mins >= 3) {
    //  openNotification('warning', 'Quota Exceeded', 'You have reached the maximum quota of 1 comparitive summaries in the last 10 minutes.');
    //  openNotification('info', 'Quota Exceeded', 'Please avoid spamming AI and try again after some time.');
    //  setSummarizerLoading(false); // Add this line to stop the loading state
    //  return;
    //}

    // Check if dual service enabled and logs2 not found
    if (dualServiceCompare && logs2.length === 0) {
      openNotification('warning', 'No 2nd service logs found', 'Please disable dual service mode or fecth 2nd service logs to continue');
      setSummarizerLoading(false); // Add this line to stop the loading state
      carouselRef.current.goTo(0); // Move carousel back to logs
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

    // Apply user selected filters for logs2 if available
    const myLogs2 = filteredLogs2.map((log) =>
      JSON.stringify(log.replace(/^\[\d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}\] /, ''), null, 2)
    )

    const totalLogsCount = myLogs.length + myLogs2.length;

    // ask for confimation if logs are more than 500
    if (totalLogsCount > 500) {
      Modal.confirm({
        title: 'Logs are more than 500',
        content: 'This might take a while to embed the logs. You can cancel and apply search filters to reduce the number of logs or continue with summarization.',
        onOk() {
          // continue with summarization
        },
        onCancel() {
          setSummarizerLoading(false); // Add this line to stop the loading state
          carouselRef.current.goTo(0); // Move carousel back to logs
          return;
        },
      });
    }

    // 0.5 seconds per 2 log line
    const estimatedTime = ((Math.ceil(myLogs.length / 2) * 0.5) + (Math.ceil(myLogs2.length / 2) * 0.5) / 60);
    openNotification('info', 'Summarizing Logs', 'Estimated wait time is ' + estimatedTime + ' minutes', <Spin />);

    // Call the summarizer function and pass necessary parameters
    try{
      console.log('User Prompt:', userPrompt);
      console.log('Lenght of total filtered logs:', totalLogsCount);
      let data;
      if (dualServiceCompare) {
        console.log('Lenght of filtered logs2:', myLogs2.length);

        data = await fetchComparitiveRAGSummary(
                                  userPrompt, 
                                  myLogs, 
                                  myLogs2
                                );
      } else {
        data = await fetchRAGSummary(userPrompt, myLogs);
      }
      if (!data.response) {
        throw new Error(data.message);
      }
      console.log('Response:', data.response);
      setLlmResponse(data.response);
      storeSummary(data.response);
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
    try{
      const summary = {
        isDualService: dualServiceCompare,
        service: form.getFieldValue('service_name'),
        service2: form.getFieldValue('service_2_name'),
        timeRange: timeRange.map((time) => dayjs(time).format('DD-MM-YYYY HH:mm:ss')),
        userPrompt: userPrompt,
        response: response,
        timestamp: dayjs().format('DD-MM-YYYY HH:mm:ss'),
      };
      console.log('Summary Constructed:', summary);
      const summaries = JSON.parse(localStorage.getItem('summaries')) || [];
      summaries.push(summary);
      localStorage.setItem('summaries', JSON.stringify(summaries));
    }
    catch (error) {
    console.error('Failed to store summary:', error);
    openNotification('error', 'Error Storing Summary', error.message || 'An error occurred while storing the summary.');
  }
}

  const handleCopyClick = async (content) => {
    try {
        await window.navigator.clipboard.writeText(content);
        openNotification('success', 'Copied to clipboard', 'The response has been copied to clipboard.');
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        openNotification('error', 'Copy to clipboard failed', err.message || 'An error occurred while copying to clipboard');
    }
  };

  const openNotification = (type, message, description, icon) => {
    notification[type]({
      message: message,
      description: description,
      icon: icon,
      placement: 'topRight',
    });
  };

  const onFinish = async (values) => {

    // flash a loading notification from antd
    openNotification(
              'info', 
              'Fetching Logs',
              'Please wait while we fetch the logs...',
              <Spin />
            );

    setLoading(true);
    setLogs([]);  // Reset logs
    setLogs2([]);  // Reset logs2

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
      const data = await fetchReducedLogs(values.service_name, timeRange, reductionRate, errorLogsOnly);
  
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
  
      // Remove double quotes from the logs
      const myReducedLogs = [];
      data.reduced_logs.forEach((log) => {
        const logObj = log.replace(/["']/g, '');
        myReducedLogs.push(logObj);
      });
  
      setLogs(myReducedLogs);
      setRawLogsLen(data.original_len);
      setReducedLogsLen(data.reduced_len);
  
      // Inform users if raw logs are capped at 5000
      if (data.original_len === 10000) {
        openNotification('warning', 'Logs Capped', 'The raw logs have been capped at 10,000 from start time.');
      }

      openNotification('success', 'Achieved ' + Math.round(((data.reduced_len / data.original_len) * 100 + Number.EPSILON) * 100) / 100 + ' reduction rate.', 'We\'ve brought ' + data.original_len + ' lines down to ' + data.reduced_len + ' .');

      // Construct Grafana URL
      const constructedGrafanaUrl = constructGrafanaUrl(
        values.service_name
      );
      setGrafanaUrl(constructedGrafanaUrl);  // Set the Grafana URL in state

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
        setTimeout(() => setAnimateButton(false), 10000);
      }
      , 1500);

    } catch (error) {

        console.log(error)

        // Custom error for network error
        if (error.message === 'Network Error') {
          openNotification('error', 'Network Error', 'Couldn\'t connect to the backend. Please check your internet connection.');
          return;
        }

        // Custom error for 403
        if ( error.response && error.response.status === 403) {
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

        if(values.service_2_name) {
          onFinish2(values);
        }

      }
  };

  // this will run only when 2 services are selected
  const onFinish2 = async (values) => {

    // flash a loading notification from antd
    openNotification(
              'info', 
              'Fetching 2nd Service Logs',
              'Please wait while we fetch the logs...',
              <Spin />
            );

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
      const data = await fetchReducedLogs(values.service_2_name, timeRange, reductionRate, errorLogsOnly);
  
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
  
      // Remove double quotes from the logs
      const myReducedLogs = [];
      data.reduced_logs.forEach((log) => {
        const logObj = log.replace(/["']/g, '');
        myReducedLogs.push(logObj);
      });
  
      setLogs2(myReducedLogs);
      // Have to set the rawLogsLen and reducedLogsLen for the 2nd service
      setRawLogs2Len(data.original_len);
      setReducedLogs2Len(data.reduced_len);
  
      // Inform users if raw logs are capped at 5000
      if (data.original_len === 10000) {
        openNotification('warning', 'Logs Capped', 'The raw logs have been capped at 10,000 from start time.');
      }

      openNotification('success', 'Achieved ' + Math.round(((data.reduced_len / data.original_len) * 100 + Number.EPSILON) * 100) / 100 + ' reduction rate.', 'We\'ve brought ' + data.original_len + ' lines down to ' + data.reduced_len + ' .');

      //Construct Grafana URL
      const constructedGrafanaUrl = constructGrafanaUrl(
        values.service_2_name
      );
      setGrafanaUrl2(constructedGrafanaUrl);  // Set the Grafana URL in state

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
        setTimeout(() => setAnimateButton(false), 10000);
      }
      , 1500);

    } catch (error) {

        console.log(error)

        // Custom error for network error
        if (error.message === 'Network Error') {
          openNotification('error', 'Network Error', 'Couldn\'t connect to the backend. Please check your internet connection.');
          return;
        }

        // Custom error for 403
        if ( error.response && error.response.status === 403) {
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

  // Grafana URL for View Raw Logs functionality
  const constructGrafanaUrl = (service) => {
    const from = dayjs(timeRange[0]).valueOf(); // Milliseconds since epoch
    const to = dayjs(timeRange[1]).valueOf();
    //const constructedGrafanaUrl = `https://logman.swiggyops.de/d/mkqRUh-Mk/service-logs?orgId=1&var-service=${service}&var-search=&var-AND=&from=${from}&to=${to}&viewPanel=2`;
    const constructedGrafanaUrl = `https://logmanv2.swiggyops.de/d/cdt0tdse768lcf/service-logs?orgId=1&var-service=${service}&var-Search=&viewPanel=1&from=${from}&to=${to}`
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

  const toggleDualServiceCompare = () => {

    setDualServiceCompare(!dualServiceCompare);
    form.setFieldsValue({ service_2_name: '' });
    setLogs2([]);  // Reset logs2

    if (!dualServiceCompare) {
      setUserPrompt("Summarize and bring up any anomalies by comparing given 2 service logs")
      openNotification('info', 'Dual Service Compare', <p>You have <b>enabled</b> dual service compare mode</p>);
    } else {
      setUserPrompt("Summarize and bring up any anomalies in the logs")
      openNotification('info', 'Dual Service Compare', <p>You have <b>disabled</b> dual service compare mode</p>);
    }
  };
  
  return (
    <div>

      {/* Progress bar */}
      <ReduceProgress fetch={fetch} reduce={reduce} format={format} display={display} />

      {/* Dashboard input card */}
     
      <InputSection
        form={form}
        onFinish={onFinish}
        timeRange={timeRange}
        handlePredefinedTimeRange={handlePredefinedTimeRange}
        handleTimeRangeChange={handleTimeRangeChange}
        selectedQuickRange={selectedQuickRange}
        dualServiceCompare={dualServiceCompare}
        toggleDualServiceCompare={toggleDualServiceCompare}
        errorLogsOnly={errorLogsOnly}
        setErrorLogsOnly={setErrorLogsOnly}
      />

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
        
        {/* Reduced logs display card */}
        <LogsDisplaySection 
                  form={form}
                  rawLogsLen={rawLogsLen}
                  reducedLogsLen={reducedLogsLen}
                  filteredLogs={filteredLogs}
                  showOnly={showOnly}
                  setShowOnly={setShowOnly}
                  wrapLines={wrapLines}
                  setWrapLines={setWrapLines}
                  isFullScreen={isFullScreen}
                  toggleFullScreen={toggleFullScreen}
                  handleSearch={handleSearch}
                  handleDownload={handleDownload}
                  animateButton={animateButton}
                  carouselRef={carouselRef}
                  logs2={logs2}
                  rawLogs2Len={rawLogs2Len}
                  reducedLogs2Len={reducedLogs2Len}
                  filteredLogs2={filteredLogs2}
                  dualServiceCompare={dualServiceCompare}
                  grafanaUrl={grafanaUrl}
                  grafanaUrl2={grafanaUrl2}
                  />

        {/* AI summary display card */}
        <SummaryDisplaySection 
                  userPrompt={userPrompt}
                  llmResponse={llmResponse}
                  startSummary={startSummary}
                  summarizerLoading={summarizerLoading}
                  handleCopyClick={handleCopyClick}
                  summariesCountInLast5Mins={summariesCountInLast5Mins}
                  comparitiveSummariesCountInLast10Mins={comparitiveSummariesCountInLast10Mins}
                  />

      </Carousel>
    </div>
  );
};

export default Dashboard;
