@echo off
chcp 65001
set APP_TOP=%~dp0
set NODE_PATH=%APP_TOP%node-v24.18.0-win-x64\
set PATH=%APP_TOP%bin;%NODE_PATH%;%PATH%

if "%1"=="" (
  cmd
  exit /b 1
)

%NODE_PATH%node.exe %1 %2 %3 %4 %5 %6 %7 %8 %9
