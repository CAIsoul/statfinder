export interface NavItem {
    Name: string;
    Label: string;
    Icon?: any;
    Route?: string;
    SubItems?: NavItem[];
}   