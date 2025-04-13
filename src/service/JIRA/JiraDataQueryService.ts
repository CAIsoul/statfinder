import { AxiosInstance, AxiosResponse } from 'axios';
import config from '../../../config';
import { Board, Issue, Sprint, SprintReport } from '../../models/JiraData';
import { getAxiosInstance, setupInterceptors } from '../AxiosService';

const { baseApiUrl, debug } = config;
const BASE_URL: string = baseApiUrl;

class JiraDataQueryService {
    private _axios: AxiosInstance;

    constructor() {
        this._axios = getAxiosInstance({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    setup(options: any) {
        setupInterceptors(this._axios, options);
    }

    /**
     * Retrieves sprint data for a specific sprint ID.
     * 
     * @param {number} sprintId - The ID of the sprint to fetch data for
     * @returns {Promise<Sprint[]>} Array containing the sprint data
     * @throws {Error} If the request fails
     */
    async getSprintById(sprintId: number): Promise<Sprint> {
        try {
            const params = { sprintId };
            const response: AxiosResponse<Sprint[]> = await this._axios.get('/get-sprint-data', { params });

            return response.data[0];
        } catch (error) {
            console.log('Error fetching sprint data: ', error);
            throw error
        }
    }

    async getBoards(options: any): Promise<Board[]> {
        try {
            const { type } = options;
            const params = { type };

            const response: AxiosResponse<any> = await this._axios.get('/get-boards', { params });
            return response.data.values;
        } catch (error) {
            console.log("Error fetching boards:", error);
            throw error;
        }
    }

    async getSprintsByBoardId(boardId: number): Promise<Sprint[]> {
        try {
            const params = { boardId };

            const response: AxiosResponse<any> = await this._axios.get('/get-board-sprints', { params });
            return response.data;
        } catch (error) {
            console.log("Error fetching sprints:", error);
            throw error;
        }
    }

    async getIssuesBySprintId(sprintId: number): Promise<Issue[]> {
        try {
            const params = { sprintId };

            if (debug) {
                console.log(`Get issues by sprint id - ${sprintId}`);
            }

            const response: AxiosResponse<any> = await this._axios.get('/get-sprint-issues', { params });
            return response.data;

        } catch (error) {
            console.log("Error fetching issues:", error);
            throw error;
        }
    }

    /**
     * Get sprint report data.
     *
     * @param {number} sprintId
     * @return {*}  {Promise<any>}
     * @memberof JiraDataQueryService
     */
    async getSprintReport(boardId: number, sprintId: number): Promise<SprintReport> {
        try {
            const params = { boardId, sprintId };

            if (debug) {
                console.log(`Get sprint report by sprint id - ${sprintId}`);
            }

            const response: AxiosResponse<any> = await this._axios.get('/get-sprint-report', { params });

            return response.data;
        } catch (error) {
            console.log("Error fetching sprint report:", error);
            throw error;
        }
    }
}

export const jiraQuery = new JiraDataQueryService();