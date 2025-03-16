export enum BoardTypeEnum {
    SIMPLE = 'simple',
    SCRUM = 'scrum',
    KANBAN = 'kanban',
}

export enum SprintStateEnum {
    CLOSED = 'closed',
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
    isPrivate: boolean;

    avatarUrls?: string[];
    projectTypeKey: string;
    simplified?: boolean;
    style?: string;
}

export interface Sprint {
    id: number;
    name: string;
    state: SprintStateEnum;
    startDate: string;
    endDate: string;
    completeDate: string;
    originBoardId: number;
    url: string;
}

export interface Issue {
    id: number;
    key: string;
    fields: any;
}