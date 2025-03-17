import { AxiosInstance, AxiosResponse } from 'axios';
import config from '../../../config';
import { Board, Issue, Sprint } from '../../models/JiraData';
import { getAxiosInstance, setupInterceptors } from '../AxiosService';

const { baseApiUrl } = config;
const BASE_URL: string = baseApiUrl;

class JiraDataService {
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

    async getSprintByIds(sprintId: number): Promise<any[]> {
        try {
            const params = { sprintId };
            const response: AxiosResponse<any> = await this._axios.get('/get-sprint-data', { params });

            return response.data;
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
            const response: AxiosResponse<any> = await this._axios.get('/get-sprint-issues', { params });

            // const issueDict = new Map<number, Issue>();
            // response.data.forEach((issue: Issue) => {
            //     if(!issue.fields.parent) {
            //         issueDict.set(issue.id, issue);
            //     }
            // });

            // response.data.forEach((issue: Issue) => {
            //     if(issue.fields.parent) {
            //         const parentIssue = issueDict.get(issue.fields.parent.id);
            //         if(parentIssue){
            //             parentIssue.fields.subtasks.
            //         }
            //     }
            // });

            return response.data;

        } catch (error) {
            console.log("Error fetching issues:", error);
            throw error;
        }
    }
}

export const jira = new JiraDataService();