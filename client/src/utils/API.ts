// axiosInstance.ts
import axios from 'axios';
import { toast } from 'react-toastify';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Set your API base URL
    timeout: 10000, // Set a timeout for requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Modify the request config before sending it
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
        }
        return config;
    },
    (error) => {
        // Handle the error
        toast.error('An error occurred while sending the request');
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Handle successful responses
        return response;
    },
    (error) => {

        const {status,response,request,message} = error;

        // Handle errors
        if (response) {
                        
            if(status === 401){
                return Promise.reject("invalid Credentials");
            }
            // The request was made and the server responded with a status code
            toast.error(`Error Response: ${response.data}`);
            toast.error(`Error Status: ${response.status}`);
            toast.error(`Error Headers: ${JSON.stringify(response.headers)}`);
        } else if (request) {
            // The request was made but no response was received
            toast.error('No response received from the server');
        } else {
            // Something happened in setting up the request that triggered an Error
            toast.error(`Error: ${message}`);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
