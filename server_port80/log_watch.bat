@echo off
chcp 65001
set CWD=%~dp0
if "%APP_TOP%"=="" set APP_TOP=%CWD%..\
set PATH=%APP_TOP%bin;%PATH%

set /p line=   < %CWD%logs\latest_log.txt

%APP_TOP%\bin\busybox.exe tail -f %line%
pause
