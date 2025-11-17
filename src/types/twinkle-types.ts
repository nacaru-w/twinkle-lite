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

export interface WarningTemplateDict {
    [name: string]: {
        description: string,
        warning?: string,
        tooltip?: string,
        sust?: boolean,
        groupable?: boolean
        talkPage?: boolean,
        sysopOnly?: boolean,
        subgroup?: ListElementData[]
    }
}

export interface APIPageResponse {
    pageid: number, ns: number, revisions: any[], title: string
}

export interface PageCreationBasicInfo {
    author: string,
    timestamp: string
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
        params?: ParamObject[]
    }
}

export interface ParamObject {
    paramName: string;
    paramValue: QuickFormInputValue
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
        talkPage?: boolean,
        end?: boolean
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

export interface BlockInfoObject {
    blockStart: string,
    blockEnd: string,
    reason?: string
}

export interface Settings {
    tagsActionsMenuCheckbox: boolean,
    DRMActionsMenuCheckbox: boolean,
    HideDiffPageCheckbox: boolean,
    PPActionMenuCheckbox: boolean,
    SDActionsMenuCheckbox: boolean,
    ReportsActionsMenuCheckbox: boolean,
    ReportsUserToolLinksMenuCheckbox: boolean,
    WarningsActionsMenuCheckbox: boolean,
    WarningsUserToolLinksMenuCheckbox: boolean,
    FBButtonMenuCheckbox: boolean,
    DRCPageMenuCheckbox: boolean,
    DRCActionsMenuCheckbox: boolean,
    BAButtonMenuCheckbox: boolean,
    MTSActionsMenuCheckbox: boolean,
    NBRButtonsCheckbox: boolean
    askConfirmationCheckbox: boolean,
    useAdmintabTemplateCheckbox: boolean
}

export type BlockAppealResolution = 'Rechazo' | 'Aprobación';

export interface MovePageOptions {
    destination: string,
    removeRedirect: boolean,
    moveTalk?: boolean,
    watch?: boolean,
    reason?: string,
}

export interface NoticeboardRequestInfo {
    title: string,
    sectionNumber: number | string,
    anchor: string
}

export interface NoticeboardResolutionInput {
    resolutionText: string,
    notify: boolean,
    useAdmintabTemplate: boolean
}