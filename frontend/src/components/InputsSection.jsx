import React, { useState } from 'react';
import { Card, Form, Select, Button, Slider, DatePicker, Collapse, Space, Spin, Popover } from 'antd';
import { AlignCenterOutlined, CloseCircleOutlined } from '@ant-design/icons';

const InputSection = ({
    form,
    services,
    dualServiceCompare,
    toggleDualServiceCompare,
    selectedQuickRange,
    handlePredefinedTimeRange,
    timeRange,
    handleTimeRangeChange,
    reductionRate,
    setReductionRate,
    loading,
    onFinish
}) => {

      // time range selection helpers
  const predefinedTimeRanges = [
    { label: '5 mins', value: 5 / 60 },
    { label: '10 mins', value: 10 / 60 },
    { label: '15 mins', value: 15 / 60 },
    { label: '30 mins', value: 30 / 60 },
    { label: '1 hr', value: 1 },
  ];

    return (
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

            {/*Service name select*/}
            <Form.Item
                label={dualServiceCompare ? "Service 1 Name" : "Service Name"}
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

            {/*Service name 2 select*/}
            {dualServiceCompare && (
                <Form.Item
                label="Service 2 Name"
                name="service_2_name"
                rules={[{ required: false}]}
                style={{ flex: 1, minWidth: '200px'}}
                >
                <Select 
                    //placeholder="Select 2nd Service" 
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
            )}

            {/* Add Dual Service Compare Button */}
            <Form.Item>
                <Popover title="Toggle dual service mode" trigger="hover">
                <Button
                    type="primary"
                    onClick={toggleDualServiceCompare}
                    style={{ 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px',
                    marginLeft: '-15px',
                    marginTop: '-5px',
                    transform: dualServiceCompare ? 'scale(.5)' : 'scale(.6)',
                    }}
                >
                    <CloseCircleOutlined
                    style={{ 
                        transform: !dualServiceCompare ? 'rotate(45deg)' : '',
                        fontSize: '30px',
                    }}
                    />
                </Button>
                </Popover>
            </Form.Item>

            {/* Add Predefined Time Range Buttons */}
            <Form.Item label="Quick Time Range Selection">
                <Button.Group>
                {predefinedTimeRanges.map(({ label, value }) => (
                    <Button
                    className='zoom'
                    key={value}
                    type={selectedQuickRange === value ? 'primary' : 'default'} // Highlight selected button
                    onClick={() => handlePredefinedTimeRange(value)}
                    >
                    {label}
                    </Button>
                ))}
                </Button.Group>
            </Form.Item>

            </Space>

            {/* More Options Collapse */} {/* defaultActiveKey={1} */}
            <Collapse style={{ marginTop: '20px', marginBottom: '25px' }} > 
                <Collapse.Panel header="More Options" key="1">

                {/* Reduction Rate Input */}
                <Form.Item
                    label="Reduction Rate (%)"
                    name="reduction_rate"
                    rules={[
                    {
                        required: true,
                        type: 'number',
                        min: 5,
                        max: 95,
                        message: 'Please enter a valid reduction rate between 5 and 95!',
                    },
                    ]}
                >
                    <Slider
                    min={5}
                    max={95}
                    value={reductionRate}
                    onChange={(value) => setReductionRate(value)}
                    />
                </Form.Item>

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
                    value={timeRange}  // Bind to state
                    onChange={handleTimeRangeChange}  // Handle manual change
                    />
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
    );
}

export default InputSection;