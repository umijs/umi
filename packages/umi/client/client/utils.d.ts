export declare function assert(value: unknown, message: string): void;
export declare function compose({ fns, args, }: {
    fns: (Function | any)[];
    args?: object;
}): any;
export declare function isPromiseLike(obj: any): boolean;
