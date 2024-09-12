// api-handlers.js
import axios from 'axios';
import dayjs from 'dayjs';

import { getSuperToken } from './auth';

// Configure Axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Base URL for API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
axiosInstance.interceptors.request.use(
    async (config) => {
        const superToken = await getSuperToken();
        if (superToken) {

            // Attach the combined token to the Authorization header
            config.headers['Authorization'] = `Bearer ${superToken}`;

            //console.log('Super Token:', superToken);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to handle reduce API request
export const fetchReducedLogs = async (service_name, timeRange, reductionRate, errorLogsOnly) => {
    const reqBody = {
        service_name: service_name,
        start_time: dayjs(timeRange[0]).format('DD-MM-YYYY HH:mm:ss'),
        end_time: dayjs(timeRange[1]).format('DD-MM-YYYY HH:mm:ss'),
        reduction_rate: reductionRate,
        error_logs_only: errorLogsOnly,
    };

    //console.log('Request Body:', reqBody);

    try {
        const response = await axiosInstance.post('/reduce', reqBody);
        return response.data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Funciton to handle RAG API request
export const fetchRAGSummary = async (query, logs) => {
    try {
        const reqBody = {
            query,
            logs,
        };
        const response = await axiosInstance.post('/rag', reqBody);
        return response.data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Function to handle Comparitive RAG API request
export const fetchComparitiveRAGSummary = async (query, logs_1, logs_2) => {
    try {
        const reqBody = {
            query,
            logs_1,
            logs_2,
        };
        const response = await axiosInstance.post('/rag-comparitive', reqBody);
        return response.data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}