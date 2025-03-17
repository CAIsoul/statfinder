import axios, { AxiosInstance } from "axios";

export function getAxiosInstance(axiosOptions: any) {
    const instance = axios.create(axiosOptions);

    return instance;
};

export function setupInterceptors(instance: AxiosInstance, options: any) {
    const { showLoading, hideLoading } = options;

    instance.interceptors.request.use(
        (config) => {
            showLoading(); // 显示 loading
            return config;
        },
        (error) => {
            hideLoading(); // 隐藏 loading
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => {
            hideLoading(); // 隐藏 loading
            return response;
        },
        (error) => {
            hideLoading(); // 隐藏 loading
            return Promise.reject(error);
        }
    );
}