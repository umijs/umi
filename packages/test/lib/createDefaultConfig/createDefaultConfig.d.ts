import { IUmiTestArgs } from '../types';
export default function (cwd: string, args: IUmiTestArgs): {
    maxWorkers?: number | undefined;
    collectCoverageFrom: (string | false | undefined)[];
    moduleFileExtensions: string[];
    moduleNameMapper: {
        '\\.(css|less|sass|scss|stylus)$': string;
    };
    setupFiles: string[];
    setupFilesAfterEnv: string[];
    testEnvironment: string;
    testMatch: string[];
    testPathIgnorePatterns: string[];
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': string;
        '^.+\\.(css|less|sass|scss|stylus)$': string;
        '^(?!.*\\.(js|jsx|ts|tsx|css|less|sass|scss|stylus|json)$)': string;
    };
    verbose: boolean;
    transformIgnorePatterns: never[];
};
