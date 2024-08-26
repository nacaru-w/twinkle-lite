import { ListElementData, QuickFormElementData, QuickFormInputValue } from "./morebits-types"

export interface ProtectionStatus {
    level: string,
    expiry: string
}

export interface ProtectionOptions {
    code: "protección" | "desprotección",
    name: string,
    default?: boolean
}

export interface WikipediaTemplateDict {
    [name: string]: {
        description: string,
        warning?: string,
        tooltip?: string,
        sust?: boolean,
        groupable?: boolean
        talkPage?: boolean
        subgroup?: ListElementData[]
    }
}

// Warnings module

export interface WarningsModuleProcessedList {
    name: string;
    value: string;
    label: string;
    subgroup?: ListElementData[] | null
}

export interface templateParamsDictionary {
    [key: string]: {
        param: string;
        paramValue: QuickFormInputValue
    }
}

// Speedy deletion module
export interface SpeedyDeletionCriteriaSubgroup extends ListElementData {
    list?: {
        value: string,
        label: string
    }[]
}

export interface SpeedyDeletionCriteria {
    code: string;
    name: string;
    subgroup?: SpeedyDeletionCriteriaSubgroup;
    default?: boolean;
}

export interface SpeedyDeletionCriteriaCategories {
    general: SpeedyDeletionCriteria[];
    articles: SpeedyDeletionCriteria[];
    redirects: SpeedyDeletionCriteria[];
    categories: SpeedyDeletionCriteria[];
    userpages: SpeedyDeletionCriteria[];
    templates: SpeedyDeletionCriteria[];
    other: SpeedyDeletionCriteria[];
}

export type SpeedyDeletionCriteriaType = keyof SpeedyDeletionCriteriaCategories;

// Reports module

export interface Motive {
    link: string,
    usersSubtitle?: string,
    optionalReason: boolean
}

export interface ReportMotive {
    [motive: string]: Motive
}

// Tags module

export interface TagTemplateDict {
    [tag: string]: {
        description: string,
        warning?: string,
        sust?: boolean,
        subgroup?: QuickFormElementData[],
        groupable?: boolean,
        talkPage?: boolean
    }
}

export interface TagTemplateListElement {
    name: string,
    value: string,
    label: string,
    subgroup: QuickFormElementData[] | '',
}

export interface TwinkleLiteWindow extends Window {
    TwinkleLite?: boolean
}