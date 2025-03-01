import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from '../../config';
import { Board } from '../models/JiraData';

const { jiraBaseUrl, jiraUsername, jiraToken } = config;
const BASE_URL: string = jiraBaseUrl;
const BASIC_AUTH: string = `Basic ${btoa(`${jiraUsername}:${jiraToken}`)}`;

class JiraDataService {
    private _axios: AxiosInstance;

    constructor() {
        this._axios = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: BASIC_AUTH,
            },
        });
    }

    async getBoards(): Promise<Board[]> {
        try {
            const response: AxiosResponse<any> = await this._axios.get('/rest/agile/1.0/board');
            return response.data;
        } catch (error) {
            console.log("Error fetching posts:", error);
            throw error;
        }
    }
}

export const jira = new JiraDataService();