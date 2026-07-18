"use strict";
/* vim:set ts=2 sw=2 sts=2 tw=80 et: */
const fs = require("node:fs");
const { exec, execSync } = require("child_process");
const { app, BrowserWindow } = require('electron');
const xsleep = msec => new Promise(resolve => setTimeout(resolve, msec));

// ffi-napi server path
const SERVER_PATH = "..\\..\\server\\";

// event handler
process.on("SIGTERM", () => {
  console.log("SIGTERMシグナルを受信しました。安全に終了します。");
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("SIGINTシグナルを受信しました。安全に終了します。");
  process.exit(2);
});
process.on("exit", (code /*終了コード*/ ) => {
  console.log( "on exit event handler...");

  // ffi-napi-server を kill する
  execSync("start /b " + SERVER_PATH + "logs\\svr_kill.bat");
  (async function() {
    await xsleep(2000);
  })();
});


(async function() {
  await xsleep(1000);
})();

// ffi-napi-server start
exec("start /b " + SERVER_PATH + "run.bat");


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

