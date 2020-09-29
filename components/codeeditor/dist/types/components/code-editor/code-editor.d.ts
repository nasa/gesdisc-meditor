import { EventEmitter, ComponentInterface } from '../../stencil-public-runtime';
import 'brace';
import { Editor } from 'brace';
export declare class CodeEditor implements ComponentInterface {
    _editor: Editor;
    oldText: string;
    autoUpdateContent: boolean;
    durationBeforeCallback: number;
    timeoutSaving: number;
    options: any;
    readOnly: boolean;
    theme: string;
    mode: string;
    text: string;
    elm: HTMLElement;
    textChange: EventEmitter;
    setOptions(options: any): void;
    setReadOnly(readOnly: boolean): void;
    setTheme(theme: string, dynamicImport?: boolean): Promise<void>;
    setMode(mode: string, dynamicImport?: boolean): Promise<void>;
    watchText(text: string): void;
    componentDidLoad(): void;
    getEditor(): Promise<Editor>;
    init(): void;
    initEvents(): void;
    updateText(): void;
}
