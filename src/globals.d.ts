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
    };
    Api: {
        new(): {
            get(params: any): Promise<any>;
            edit(url: string, revisionCallback: (revision: Revision) => EditParams): Promise<any>;
            create(title: string, params: { summary: string }, content),
            postWithToken(type: string, params: { [param]: string })
        };
    };
    util: {
        isIPAddress(user: string, blockAllowed: boolean);
        addPortletLink(menu: string, link: string, label: string, identifier: string, tooltip: string)
    };
    loader: {
        using(string);
        load(string, string);
    }
    hook(hookType: string): {
        add(addedFunction: any)
    }
};

declare const Morebits: {
    status: StatusConstructor
    simpleWindow: SimpleWindowConstructor;
    quickForm: QuickForm;
};