import { ListElementData } from "./morebits-types"

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
        paramValue: string | number | boolean
    }
}