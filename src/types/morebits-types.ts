export interface SimpleWindowInstance {
    focus(): SimpleWindowInstance;
    close(event?: Event): SimpleWindowInstance;
    display(): SimpleWindowInstance;
    setTitle(title: string): SimpleWindowInstance;
    setScriptName(name: string): SimpleWindowInstance;
    setWidth(width: number): SimpleWindowInstance;
    setHeight(height: number): SimpleWindowInstance;
    setContent(content: HTMLElement | string): SimpleWindowInstance;
    addContent(content: HTMLElement | string): SimpleWindowInstance;
    purgeContent(): SimpleWindowInstance;
    addFooterLink(text: string, wikiPage: string, prep?: string): SimpleWindowInstance;
    setModality(modal?: boolean): SimpleWindowInstance;
}

export interface SimpleWindowConstructor {
    new(width: number, height: number): SimpleWindowInstance;
    setButtonsEnabled(enabled: boolean): void;
}

export interface QuickFormElementData {
    // Common attributes
    id?: string;
    className?: string;
    style?: string;
    tooltip?: string;
    extra?: any;
    adminonly?: boolean;

    // Specific element attributes
    type: string;
    name?: string;
    label?: string;
    value?: string;
    multiple?: boolean;
    size?: number | string;
    list?: any;
    event?: EventListener;
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    subgroup?: any;
    required?: boolean;
    readonly?: boolean;
    maxlength?: number;
    min?: number;
    max?: number;
    sublabel?: string;
    cols?: number;
    rows?: number;
    placeholder?: string;
}

export interface QuickFormElementInstance {
    append(data: QuickFormElementData): QuickFormElementInstance;
    render(): HTMLElement;
    compute(): void;
}

export interface QuickFormElementConstructor {
    new(data: QuickFormElementData): QuickFormElementInstance;
    id: number;
    generateTooltip(node: HTMLElement, data: any): void;
}

export interface QuickForm {
    element: QuickFormElementConstructor;
    getInputData(form: HTMLFormElement): object;
    getElements(form: HTMLFormElement, fieldName: string): HTMLElement[];
    getCheckboxOrRadio(elementArray: HTMLInputElement[], value: string): HTMLInputElement | null;
    getElementContainer(element: HTMLElement): HTMLElement;
    getElementLabelObject(element: HTMLElement | QuickFormElementInstance): HTMLElement;
    getElementLabel(element: HTMLElement | QuickFormElementInstance): string;
    setElementLabel(element: HTMLElement | QuickFormElementInstance, labelText: string): boolean;
    overrideElementLabel(element: HTMLElement | QuickFormElementInstance, temporaryLabelText: string): boolean;
    resetElementLabel(element: HTMLElement | QuickFormElementInstance): boolean;
    setElementVisibility(element: HTMLElement | JQuery | string, visibility?: boolean): void;
    setElementTooltipVisibility(element: HTMLElement | JQuery, visibility?: boolean): void;
}

export type QuickFormInputValue = any;
export interface QuickFormInputObject {
    [key: string]: QuickFormInputValue,
}

export interface StatusInstance {
    link(): void;
    unlink(): void;
    codify(obj: string | Element | Array<any>): DocumentFragment;
    update(status: string, type: 'status' | 'info' | 'warn' | 'error'): void;
    generate(): void;
    render(): void;
}

export interface StatusConstructor {
    new(text: string, stat: string, type?: 'status' | 'info' | 'warn' | 'error'): StatusInstance;
    init(root: HTMLElement): void;
    onError(handler: (error: any) => void): void;
    status(text: string, status: string): StatusInstance;
    info(text: string, status: string): StatusInstance;
    warn(text: string, status: string): StatusInstance;
    error(text: string, status: string): StatusInstance;
    actionCompleted(text: string): void;
    printUserText(comments: string, message: string): void;
}

// Quickform Radio element types

export interface ListElementData {
    type?: string;
    name?: string;
    label?: string;
    value?: string;
    tooltip?: string
    list?: any,
    checked?: boolean;
    disabled?: boolean;
    required?: boolean;
    event?: EventListener;
    subgroup?: any;
}