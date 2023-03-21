import { BrowserWindow } from 'electron';

declare global {
  export function getBrowserWindowRuntime(): BrowserWindow;
}
