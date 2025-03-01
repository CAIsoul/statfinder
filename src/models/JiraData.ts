enum BoardTypeEnum {
    Simple,
    Scrum,
    Kanban,
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