import { Service as UmiService } from 'umi';
export declare function generateTmp(opts: {
    cwd: string;
    Service?: typeof UmiService;
}): Promise<void>;
export declare function generateHTML(opts: {
    cwd: string;
    Service?: typeof UmiService;
}): Promise<void>;
export declare function render(opts: {
    cwd: string;
}): import("@testing-library/react").RenderResult<typeof import("@testing-library/dom/types/queries")>;
export declare function getHTML(opts: {
    cwd: string;
}): string;
