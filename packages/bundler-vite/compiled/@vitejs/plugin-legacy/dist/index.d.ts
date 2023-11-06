import { Plugin } from '../../vite';

interface Options {
    /**
     * default: 'defaults'
     */
    targets?: string | string[] | {
        [key: string]: string;
    };
    /**
     * default: false
     */
    ignoreBrowserslistConfig?: boolean;
    /**
     * default: true
     */
    polyfills?: boolean | string[];
    additionalLegacyPolyfills?: string[];
    /**
     * default: false
     */
    modernPolyfills?: boolean | string[];
    /**
     * default: true
     */
    renderLegacyChunks?: boolean;
    /**
     * default: false
     */
    externalSystemJS?: boolean;
    /**
     * default: true
     */
    renderModernChunks?: boolean;
}

declare function viteLegacyPlugin(options?: Options): Plugin[];
declare function detectPolyfills(code: string, targets: any, list: Set<string>): Promise<void>;
declare const cspHashes: string[];

export { cspHashes, viteLegacyPlugin as default, detectPolyfills };
