export declare enum ApplyPluginsType {
    compose = "compose",
    modify = "modify",
    event = "event"
}
interface IPlugin {
    path?: string;
    apply: Record<string, any>;
}
export declare class PluginManager {
    opts: {
        validKeys: string[];
    };
    hooks: {
        [key: string]: any;
    };
    constructor(opts: {
        validKeys: string[];
    });
    register(plugin: IPlugin): void;
    getHooks(keyWithDot: string): any;
    applyPlugins({ key, type, initialValue, args, async, }: {
        key: string;
        type: ApplyPluginsType;
        initialValue?: any;
        args?: object;
        async?: boolean;
    }): any;
    static create(opts: {
        validKeys: string[];
        plugins: IPlugin[];
    }): PluginManager;
}
export {};
