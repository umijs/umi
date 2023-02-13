export { isCancel } from '@clack/core';

interface TextOptions {
    message: string;
    placeholder?: string;
    validate?: (value: string) => string | void;
}
declare const text: (opts: TextOptions) => Promise<string | symbol>;
interface ConfirmOptions {
    message: string;
    active?: string;
    inactive?: string;
    initialValue?: boolean;
}
declare const confirm: (opts: ConfirmOptions) => Promise<string | symbol>;
interface Option {
    value: any;
    label?: string;
    hint?: string;
}
interface SelectOptions<Options extends Option[]> {
    message: string;
    options: Options;
    initialValue?: Options[number]["value"];
}
declare const select: <Options extends Option[]>(opts: SelectOptions<Options>) => Promise<string | symbol>;
declare const multiselect: <Options extends Option[]>(opts: SelectOptions<Options>) => Promise<string | symbol>;
declare const cancel: (message?: string) => void;
declare const intro: (title?: string) => void;
declare const outro: (message?: string) => void;
declare const spinner: () => {
    start(message?: string): void;
    stop(message?: string): void;
};

export { ConfirmOptions, SelectOptions, TextOptions, cancel, confirm, intro, multiselect, outro, select, spinner, text };
