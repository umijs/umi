import { ipcMain } from 'electron';

ipcMain.handle('getPlatform', () => {
  return `hi, i'm from ${process.platform}`;
});
