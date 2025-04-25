export enum BoardTypeEnum {
    SIMPLE = 'simple',
    SCRUM = 'scrum',
    KANBAN = 'kanban',
}

export enum SprintStateEnum {
    CLOSED = 'closed',
    ACTIVE = 'active',
    FUTURE = 'Future',
}

export enum IssueTypeEnum {
    STORY = 'Story',
    BUG = 'Bug',
    SPRINT_TASK = 'Sprint Task',
    SPRINT_BUG = 'Sprint Bug',
    SUB_TEST_EXECUTION = 'Sub Test Execution',
    TEST_PLAN = 'Test Plan',
    CHANGE_REQUEST = 'Change Request'
}

export enum IssueStatusEnum {
    IN_PROGRESS = 'In Progress',
    DONE = 'Done',
    IN_REVIEW = 'In Review',
    ACCEPTANCE = 'Acceptance',
    FINAL_REVIEW = 'Final Review',
    CLOSED = 'Closed',
    FIXED = 'Fixed',
    IN_BACKLOG = 'In Backlog',
    VERIFICATION = 'Verification',
    UNKNOWN = 'Unknown',
}

export enum IssuePriorityEnum {
    HIGHEST = 'Highest',
    URGENT = 'Urgent',
    HIGH = 'High',
    MEDIUM = 'Medium',
}

export enum EFFORT_TYPE {
    NEW_FEATURE = 'New Feature',
    CHANGE_REQUEST = 'Change Request',
    TESTING = 'Testing',
    EXISTING_BUG = 'Existing Bug',
    VERIFICATION = 'Verification',
    CODE_REVIEW = 'Code Review',
    CODE_REFACTOR = 'Code Refactor',
    DEV_TEST = 'Dev Test',
    OTHER = 'Other',
}

export enum RoleEnum {
    DEVELOPER = 'Developer',
    QA = 'QA',
    SCRUM_MASTER = 'Scrum Master',
    PRODUCT_OWNER = 'Product Owner',
    UNKNOWN = 'Unknown',
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
    duration: number;

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
    storyPointPerDay?: number;
}

export interface SprintReport {
    contents: SprintReportContents;
    sprint: Sprint;
    supportsPages: boolean;
}

interface SprintReportContents {
    allIssuesEstimateSum: ContentItem;
    completedIssues: any[];
    completedIssuesEstimateSum: ContentItem;
    completedIssuesInitialEstimateSum: ContentItem;
    issueKeysAddedDuringSprint: any;
    issuesCompletedInAnotherSprint: any[];
    issuesCompletedInAnotherSprintEstimateSum: ContentItem;
    issuesCompletedInAnotherSprintInitialEstimateSum: ContentItem;
    issuesNotCompletedEstimateSum: ContentItem;
    issuesNotCompletedInCurrentSprint: any[];
    issuesNotCompletedInitialEstimateSum: ContentItem;
    puntedIssues: any[];
    puntedIssuesEstimateSum: ContentItem;
    puntedIssuesInitialEstimateSum: ContentItem;
}

interface ContentItem {
    text: string;
    value?: number;
}

export interface Issue {
    id: number;
    key: string;
    self: string;
    fields: IssueExtension;

    summary: string;
    issuetype: IssueTypeEnum;
    status: IssueStatusEnum;
    priority: IssuePriorityEnum;
    storyPoint: number;
    contributions: Contribution[];

    description?: string;
    updated?: string;
    duedate?: string;
    resolutiondate?: string;
    reporter?: string;
    contributor?: string;
    isRemoved?: boolean;
    isNewlyAdded?: boolean;
    isRollOvered?: boolean;
    isCompleted?: boolean;
    storyBugCount?: number;
    timeSpentTotal?: number;
    timeSpentOnImplementation?: number;
    timeSpentOnVerification?: number;
    timeSpentOnDevTest?: number;
    timeSpentOnBugFixing?: number;
    isCompletedInCurrentSprint?: boolean;
}

export interface IssueExtension {
    summary: string;
    issuetype: IssueType;
    status: IssueStatus;
    priority: IssuePriority;

    timespent?: number;
    aggregatetimespent?: number;
    aggregatetimeoriginalestimate?: number;
    timeoriginalestimate?: number;
    description?: string;
    updated?: string;
    duedate?: string;
    resolutiondate?: string;
    reporter?: JiraAccount;
    project?: Project;
    sprint?: Sprint;
    worklog?: { worklogs: Worklog[] }
    parent?: Issue;
    closedSprints: Sprint[];
    subtasks: Issue[];

    // Story point
    customfield_10026?: number;

    // Developers
    customfield_10042?: JiraAccount[];
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
    timeSpentSeconds: number;
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

export interface IssueRow extends Issue {
    children?: IssueRow[];
}

export interface Contribution {
    Contributor: TeamMember;
    TimeInSeconds: number;
}

export interface TeamMember {
    name: string;
    role: RoleEnum;
}