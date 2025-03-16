export enum BoardTypeEnum {
    SIMPLE = 'simple',
    SCRUM = 'scrum',
    KANBAN = 'kanban',
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
}