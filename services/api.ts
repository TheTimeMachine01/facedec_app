import axios from 'axios';
import { router } from 'expo-router'; // Used for redirection on logout/erro
import * as SecureStore from 'expo-secure-store';

// !!! IMPORTANT: REPLACE THIS WITH YOUR ACTUAL RENDER.COM BACKEND URL !!!
// Example: 'https://your-spring-boot-app.onrender.com/api'
// const API_BASE_URL = 'https://rtu-clubs-backend.onrender.com';
// const API_BASE_URL = 'https://facedec.up.railway.app';
// const API_BASE_URL = 'https://face-dec.onrender.com';
// const API_BASE_URL = 'http://192.168.1.14:8080';
// const API_BASE_URL = 'http://10.229.113.163:8080';
const API_BASE_URL = 'http://10.187.26.163:8080';


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Variables to manage token refreshing state
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

// Function to process the queue of failed requests
const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            if (token) {
                prom.resolve(token);
            } else {
                prom.reject(new Error("Token refresh failed or no token provided."));
            }
        }
    });
    failedQueue = []; // Clear the queue after processing
};

// Request Interceptor: Attaches the access token to outgoing requests
api.interceptors.request.use(
    async (config) => {
        // Retrieve the access token from secure storage
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
            // If an access token exists, add it to the Authorization header
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config; // Return the modified config
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles token expiration (401 Unauthorized) and refreshes tokens
api.interceptors.response.use(
    (response) => response, // If response is successful, just return it
    async (error) => {
        const originalRequest = error.config; // Get the original request configuration
        // Check if the error is a 401 Unauthorized, and it's not already a retry or a refresh request
        if (error.response?.status === 401 && !originalRequest._retry) {
            // If a token refresh is already in progress, queue the current request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject }); // Add to queue to be retried later
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`; // Update token in original request
                    return api(originalRequest); // Retry the original request
                }).catch(err => {
                    return Promise.reject(err); // Propagate error if queue processing fails
                });
            }
            originalRequest._retry = true; // Mark this request as a retry attempt
            isRefreshing = true; // Set flag to indicate token refresh is in progress

            const refreshToken = await SecureStore.getItemAsync('refreshToken'); // Get the refresh token

            // If no refresh token is found, or it's invalid, redirect to login
            if (!refreshToken) {
                processQueue(error, null); // Reject all queued requests
                await SecureStore.deleteItemAsync('accessToken'); // Clear any invalid access token
                router.replace('/(auth)/login'); // Redirect to login page
                return Promise.reject(error); // Propagate the original error
            }

            try {
                // Attempt to refresh the token by sending the refresh token to the backend
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                // Store the new tokens securely
                await SecureStore.setItemAsync('accessToken', newAccessToken);
                await SecureStore.setItemAsync('refreshToken', newRefreshToken);

                // Update the default Authorization header for the axios instance
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                // Update the Authorization header of the original failed request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken); // Resolve all queued requests with the new token
                return api(originalRequest); // Re-run the original request with the new access token
            } catch (refreshError) {
                // If refresh fails, clear all tokens and redirect to login
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                processQueue(refreshError, null); // Reject all queued requests
                router.replace('/(auth)/login'); // Redirect to login page
                return Promise.reject(refreshError); // Propagate the refresh error
            } finally {
                isRefreshing = false; // Reset the refreshing flag
            }
        }

        return Promise.reject(error); // For any other type of error, just propagate it
    }
);

export default api; // Export the configured axios instance