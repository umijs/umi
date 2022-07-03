declare type ConsoleFunctionName = {
    [T in keyof Console]: Console[T] extends (...args: any[]) => any ? T : never;
}[keyof Console];
export declare type MessageStore = any[][] | ((...args: any[]) => void);
export declare type MessageStoreWithType = [ConsoleFunctionName, ...any[]][] | ((name: ConsoleFunctionName, ...args: any[]) => void);
interface ResetMockConsole<T> {
    (): void;
    messages: T;
}
interface MockConsoleFunction<T> {
    (messageStore?: T): ResetMockConsole<T>;
}
interface MockConsole extends Record<ConsoleFunctionName, MockConsoleFunction<MessageStore>>, MockConsoleFunction<MessageStoreWithType> {
}
declare const _default: MockConsole;
export default _default;
