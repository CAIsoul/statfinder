export enum BoardTypeEnum {
    SIMPLE = 'simple',
    SCRUM = 'scrum',
    KANBAN = 'kanban',
}

export enum SprintStateEnum {
    CLOSED = 'closed',
}

export enum IssueTypeEnum {
    STORY = 'Story',
    BUG = 'Bug',
    SPRINT_TASK = 'Sprint Task',
    SPRINT_BUG = 'Sprint Bug',
    SUB_TEST_EXECUTION = 'Sub Test Execution',
    TEST_PLAN = 'Test Plan'
}

export enum IssueStatusEnum {

}

export enum IssuePriorityEnum {

}

export interface Board {
    id: number;
    name: string;
    type: BoardTypeEnum;
    isPrivate: boolean;

    url?: string;
    location?: Project;
}

export interface Project {
    id: number;
    name: string;
    key: string;
    isPrivate?: boolean;
    avatarUrls?: string[];
    projectTypeKey: string;
    simplified?: boolean;
    style?: string;
}

export interface Sprint {
    id: number;
    name: string;
    goal: string;
    state: SprintStateEnum;
    startDate: string;
    endDate: string;
    completeDate: string;
    originBoardId: number;

    originalCommitted?: number;
    originalCompleted?: number;
    originalNotCompleted?: number;
    originalRemoved?: number;
    newlyAdded?: number;
    newlyCompleted?: number;
    newlyNotCompleted?: number;
    totalCommitted?: number;
    totalCompleted?: number;
    totalHoursLogged?: number;
    newFeatureDevelopment?: number;
    developmentBug?: number;
    existingBug?: number;
    newFeatureTesting?: number;
}

export interface Issue {
    id: number;
    key: string;
    self: string;
    fields: IssueExtension;
}

export interface IssueExtension {
    summary: string;
    issuetype: IssueType;
    status: IssueStatus;
    priority: IssuePriority;

    description?: string;
    updated?: string;
    duedate?: string;
    resolutiondate?: string;
    reporter?: JiraAccount;
    project?: Project;
    sprint?: Sprint;
    worklog?: { worklogs: Worklog[] }
    parent?: Issue;
    subtasks: Issue[];
}

export interface IssueType {
    id: number;
    name: IssueTypeEnum;
    description: string;
    subtask: boolean;
}

export interface IssueStatus {
    id: number;
    name: IssueStatusEnum;
    description: string;
}

export interface IssuePriority {
    id: number;
    name: IssuePriorityEnum;
}

export interface Worklog {
    id: number;
    issueId: number;
    timeSpendSeconds: number;
    author: JiraAccount;
    created: string;
    started: string;
    updated: string;
}

export interface FixVersion {
    id: number;
    name: string;
    description: string;
    archived: boolean;
    released: boolean;
}

export interface JiraAccount {
    accountId: number;
    accountType: string;
    active: boolean;
    avatarUrls: any[];
    displayName: string;
    emailAddress: string;
}


export interface IssueRow {
    id: number;
    key: string;
    url: string;

    summary: string;
    issuetype: IssueTypeEnum;
    status: IssueStatusEnum;
    priority: IssuePriorityEnum;

    description?: string;
    updated?: string;
    duedate?: string;
    resolutiondate?: string;
    reporter?: string;
    children?: IssueRow[];
}
