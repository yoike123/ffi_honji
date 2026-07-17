"use strict";
/* vim:set ts=2 sw=2 sts=2 tw=80 et: */

const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadFile('index.html');

  win.webContents.on('console-message',
    ({level, message, lineNumber, sourceId, frame}) => {
      console.log(`[Browser Console - ${level} ${message} (Line: ${lineNumber}, Source: ${sourceId})`);
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

