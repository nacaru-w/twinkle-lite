/* 
This file allows TS to ignore errors related to the usage of
MW-specific variables that are available during runtime but
not defined in local development by creating a custom type
definition.
*/

declare const mw: {
    config: {
        get(key: string): string;
    };
    Api: {
        new(): {
            get(params: any): Promise<any>;
            edit(url: string, revisionCallback: (revision: Revision) => EditParams): Promise<any>;
            create(title: string, params: { summary: string }, content)
        };
    };
    util: {
        isIPAddress(user: string, blockAllowed: boolean)
    }
};

declare const Morebits: {
    status: StatusConstructor
    simpleWindow: SimpleWindowConstructor;
    quickForm: QuickForm;
};
