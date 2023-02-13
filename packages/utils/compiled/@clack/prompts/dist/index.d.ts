export { isCancel } from "@clack/core";
export interface TextOptions {
    message: string;
    placeholder?: string;
    validate?: ((value: string) => string | void);
}
export declare const text: (opts: TextOptions) => Promise<string | symbol>;
export interface ConfirmOptions {
    message: string;
    active?: string;
    inactive?: string;
    initialValue?: boolean;
}
export declare const confirm: (opts: ConfirmOptions) => Promise<string | symbol>;
interface Option {
    value: any;
    label?: string;
    hint?: string;
}
export interface SelectOptions<Options extends Option[]> {
    message: string;
    options: Options;
    initialValue?: Options[number]['value'];
}
export declare const select: <Options extends Option[]>(opts: SelectOptions<Options>) => Promise<string | symbol>;
export declare const cancel: (message?: string) => void;
export declare const intro: (title?: string) => void;
export declare const outro: (message?: string) => void;
export declare const spinner: () => {
    start(message?: string): void;
    stop(message?: string): void;
};
