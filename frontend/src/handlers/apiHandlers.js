// api-handlers.js
import axios from 'axios';
import dayjs from 'dayjs';

import { getIdToken, getAccessToken } from './auth';

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
        const idToken = await getIdToken(); // Get the JWT token
        const accessToken = await getAccessToken(); // Get the access token
        if (idToken && accessToken) {
            // Combine the ID token and access token using a pipe (|) as the delimiter
            const superToken = `${idToken}|${accessToken}`;
            //console.log('Super Token:', superToken);

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
export const fetchReducedLogs = async (values, reductionRate) => {
    const reqBody = {
        service_name: values.service_name,
        start_time: dayjs(values.time_range[0]).format('DD-MM-YYYY HH:mm:ss'),
        end_time: dayjs(values.time_range[1]).format('DD-MM-YYYY HH:mm:ss'),
        reduction_rate: reductionRate,
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