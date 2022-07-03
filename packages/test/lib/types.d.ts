import { ArgsType } from '@umijs/utils';
import { runCLI } from 'jest';
import { options as CliOptions } from 'jest-cli/build/cli/args';
export interface IUmiTestArgs extends Partial<ArgsType<typeof runCLI>['0']> {
    version?: boolean;
    cwd?: string;
    debug?: boolean;
    e2e?: boolean;
    package?: string;
}
export declare type PickedJestCliOptions = {
    [T in keyof typeof CliOptions]?: T extends keyof IUmiTestArgs[T] ? T : typeof CliOptions[T] extends {
        alias: infer U;
    } ? IUmiTestArgs[T] : never;
};
