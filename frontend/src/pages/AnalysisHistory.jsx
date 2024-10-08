import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Space, Typography, Popconfirm, notification, DatePicker, Divider, Popover } from 'antd';
import { DeleteOutlined, EyeOutlined, SearchOutlined, FileDoneOutlined, DownloadOutlined, InfoCircleOutlined, FilterOutlined, FilterFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';


const AnalysisHistory = () => {
  const [summaries, setSummaries] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dualSummaryToggle, setDualSummaryToggle] = useState(false);

  useEffect(() => {
    const storedSummaries = JSON.parse(localStorage.getItem('summaries')) || [];
    // Display summary only having isDualService as true when toggled to dual summary view
    const displaySummaries = storedSummaries.filter(summary => !(dualSummaryToggle ^ summary.isDualService));
    setSummaries(displaySummaries);
    setFilteredSummaries(displaySummaries);
  }, [dualSummaryToggle]);

  const openNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  const handleDeleteSummary = (timestamp) => {

    // Cannot delete summary if timestamp is less then 5 mins from now
    const summaryTimestamp = dayjs(timestamp, 'DD-MM-YYYY HH:mm:ss');
    const now = dayjs();
    const diff = now.diff(summaryTimestamp, 'minute');
    if (diff < 5) {
      notification.error({ message: 'Cannot delete summary', description: 'Summary cannot be deleted if it is less than 5 minutes old.' });
      return;
    }

    const updatedSummaries = summaries.filter(summary => summary.timestamp !== timestamp);
    setSummaries(updatedSummaries);
    setFilteredSummaries(updatedSummaries);
    localStorage.setItem('summaries', JSON.stringify(updatedSummaries));
    notification.success({ message: 'Summary deleted successfully!' });
  };

  const handleClearAll = () => {
    setSummaries([]);
    setFilteredSummaries([]);
    localStorage.removeItem('summaries');
    notification.success({ message: 'All summaries cleared successfully!' });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = summaries.filter(summary =>
      summary.userPrompt.toLowerCase().includes(value) ||
      summary.response.toLowerCase().includes(value)
    );
    setFilteredSummaries(filtered);
  };

  const handleViewSummary = (summary) => {
    setSelectedSummary(summary);
    setModalVisible(true);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(summaries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summaries');
    XLSX.writeFile(workbook, `analysis_summaries_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    notification.success({ message: 'Summaries exported successfully!' });
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

  const columnsSingle = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => dayjs(a.timestamp, 'DD-MM-YYYY HH:mm:ss').unix() - dayjs(b.timestamp, 'DD-MM-YYYY HH:mm:ss').unix(),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Time Range',
      dataIndex: 'timeRange',
      key: 'timeRange',
      render: (timeRange) => timeRange.join(' - '),
    },
    {
      title: 'User Prompt',
      dataIndex: 'userPrompt',
      key: 'userPrompt',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewSummary(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this summary?"
            onConfirm={() => handleDeleteSummary(record.timestamp)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columnsDouble = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => dayjs(a.timestamp, 'DD-MM-YYYY HH:mm:ss').unix() - dayjs(b.timestamp, 'DD-MM-YYYY HH:mm:ss').unix(),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Service 1',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Service 2',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Time Range',
      dataIndex: 'timeRange',
      key: 'timeRange',
      render: (timeRange) => timeRange.join(' - '),
    },
    {
      title: 'User Prompt',
      dataIndex: 'userPrompt',
      key: 'userPrompt',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewSummary(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this summary?"
            onConfirm={() => handleDeleteSummary(record.timestamp)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>

      <Typography.Title level={2}>
        <FileDoneOutlined /> Analysis History
      </Typography.Title>

      <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search summaries"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: '300px' }}
          />
          <Popover content="Toggle between single and dual summary view" title="Summary View" trigger="hover">
            <Button icon={ dualSummaryToggle ? <FilterFilled /> : <FilterOutlined />} onClick={() => setDualSummaryToggle(!dualSummaryToggle)} />
          </Popover>
        </Space>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportToExcel}>
            Export to Excel
          </Button>
          <Popconfirm
            title="Are you sure to clear all summaries?"
            onConfirm={handleClearAll}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Clear All
            </Button>
          </Popconfirm>
        </Space>
      </Space>

      <Table
        dataSource={filteredSummaries}
        columns={ dualSummaryToggle ? columnsDouble : columnsSingle}
        rowKey="timestamp"
        pagination={{ pageSize: 7 }}
      />

      {/* Summary view modal */}
      <Modal
        title="Full Summary"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Typography.Title level={4}>{selectedSummary?.userPrompt}</Typography.Title>
        <Space size="middle" style={{ marginBottom: '16px' }}>
          <div>
              <Typography.Text strong>Service:</Typography.Text>
              <Input
              value={selectedSummary?.service}
              disabled
              style={{ width: '150px', marginLeft: '8px' }}
              />
          </div>

          {dualSummaryToggle && (
            <div>
              <Typography.Text strong>Service 2:</Typography.Text>
              <Input
              value={selectedSummary?.service2}
              disabled
              style={{ width: '150px', marginLeft: '8px' }}
              />
            </div>
          )}
            </Space>
        <DatePicker.RangePicker
            value={[
                dayjs(selectedSummary?.timeRange[0], 'DD-MM-YYYY HH:mm:ss'),
                dayjs(selectedSummary?.timeRange[1], 'DD-MM-YYYY HH:mm:ss'),
            ]}
            format="DD-MM-YYYY HH:mm:ss"
            disabled
            style={{ width: '100%' }}
            />
        <Typography.Paragraph 
              style={{ marginTop: '10px' }}
              copyable={{
                tooltips: ['click to copy', 'Response copied!!'],
                text: async () =>
                  new Promise((resolve) => {
                    setTimeout( async () =>{
                      await handleCopyClick(selectedSummary?.response)
                      resolve(selectedSummary?.response);
                    }, 500);
                  }),
              }}
            >
              {selectedSummary?.response.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                  <br />
                </React.Fragment>
              ))}
        </Typography.Paragraph>

      </Modal>

      {/* Disclaimer about AI */}
      <Divider>
        <InfoCircleOutlined />
      </Divider>
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: '20px', textAlign: 'center' }}>
        These data are stored locally in your device. <br/>
        And will be wiped out when the session ends.
      </Typography.Text>
    </div>
  );
};

export default AnalysisHistory;
