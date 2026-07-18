@echo off
echo "this application is for node_v16_x86"
set CWD=%~dp0
if "%APP_TOP%"=="" set APP_TOP=%CWD%..\..\

:START
cd %CWD%
where node
if %errorlevel% equ 0 (
  for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
  for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
    set NODE_MAJOR_VERSION=%%b
  )
  if "%NODE_MAJOR_VERSION%"=="16" (
    set TARGET=node.exe
    start /b node.exe index.js
  ) else (
    set TARGET=%APP_TOP%node16.bat
    start /b call %APP_TOP%node16.bat index.js
  )
) else (
  set TARGET=%APP_TOP%node16.bat
  start /b call %APP_TOP%node16.bat index.js
)
rem 10秒待つ
rem timeout /t 10 > NUL

:LOOP

rem 監視間隔（秒）の設定（ここでは５秒）
timeout /t 5 > NUL

rem pid.txtファイルがある限り監視を続ける
if exist %CWD%logs\pid.txt (

  rem pid.txtの中身を取得(serverのプロセスID)
  set /p line=   < %CWD%logs\pid.txt >NUL 2>&1
  set /p line=   < %CWD%logs\pid.txt
  echo 読み込んだテキスト：%line%

  rem tasklistから指定PIDを検索し、存在すれば errorlevelが０になる
  tasklist /FI "PID eq %line%" | findstr /I "pid" > NUL

  if %errorlevel% equ 0 goto LOOP

  rem サーバーが落ちているとき、起動する
  goto START
)

rem pid.txtが存在しないとき、本プログラムも任務を終える
exit
