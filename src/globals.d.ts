/* 
This file allows TS to ignore errors related to the usage of
MW-specific variables that are available during runtime but
not defined in local development by creating a custom type
definition.
*/

/*
* Global variable to check whether the script has already
* been loaded or not
*/

interface Window {
    IS_TWINKLE_LITE_LOADED: boolean;
}

declare const mw: {
    config: {
        get(key: string): string;
        get(key: 'wgUserGroups'): string[];
    };
    Api: {
        new(): {
            get(params: any): Promise<any>;
            edit(url: string, revisionCallback: (revision: Revision) => EditParams): Promise<any>;
            create(title: string, params: { summary: string }, content: any): any;
            postWithToken(type: string, params: Record<string, any>): Promise<any>;
        };
    };
    util: {
        isIPAddress(user: string, blockAllowed: boolean): boolean;
        addPortletLink(
            menu: string,
            link: string,
            label: string,
            identifier: string,
            tooltip: string
        ): any;
    };
    loader: {
        using(module: string | string[]): Promise<void>;
        load(module: string, type: string): void;
    };
    hook(hookType: string): {
        add(callback: (...args: any[]) => void): void;
    };
    notify(message: string): void;
};

declare const Morebits: {
    status: StatusConstructor
    simpleWindow: SimpleWindowConstructor;
    quickForm: QuickForm;
    ip: {
        get64: Get64;
    };
};