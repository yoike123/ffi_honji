<!-- /* vim:set ts=2 sw=2 sts=2 tw=80 et: */ -->
### ffi-napi server setup
(1) PC環境に Python3, Git for windows をインストールして下さい。.  
(2) NodeJSアーカイブからnode-v16.xx.x-win-x86.zipをダウンロードし、任意のフォルダーに配置します。  
(3) (2)のフォルダーと同階層に、起動バッチを仕込みます。
(3-1)node16.bat
```bat
chcp 65001
set CWD=%~dp0
set NODE_PATH=%CWD%node-v16.20.2-win-x86\
set PATH=%CWD%bin;%NODE_PATH%;%PATH%

if "%1"=="" (
  cmd
  exit /b 1
)

%NODE_PATH%node.exe %1 %2 %3 %4 %5 %6 %7 %8 %9
```
(4-2)Execute node16.bat
```
node --version
v16.20.2    <-- yoike123's environment
npm --version
8.19.4      <-- yoike123's environment

git clone https://github.com/yoike123/ffi_honji.git
cd ffi_honji/server
type install.bat
npm install --global windows-build-tools
rem *** This command is error terminated.
rem But MS-Build-Tools-Setup.exe is download to 
rem   C:\Users\YourAccount\.windows-build-tools\vs_BuildTools.exe
rem Execute This vs_BuildTools.exe to complete VS-Tools installed.

rem About Python, Download Python 3 and Install at (2).
rem Don't Install Python 2.7.15.msi in same directory of vs_BuildTools.exe

npm config --global set msvs_version 2017
npm config --global set python python3.14.6

pip install setuptools

npm install --global node-gyp

npm install

run.bat
rem ffi-napi server is startup.
```

(4) NodeJSアーカイブからnode-v24.18.0-win-x64.zipをダウンロードし、
　　　　(2)と同階層に展開します。
  
(5) (2)と同階層に起動バッチを仕込みます。  
(5-1)node24.bat
```bat
@echo off
chcp 65001
set CWD=%~dp0
echo %CWD%
set PATH=%CWD%bin;%CWD%node-v24.18.0-win-x64;%PATH%
cmd
```

(6)Execute node24.bat
```bat
node --version
v24.18.0

npm --version
11.16.0

cd ffi_honji/client/electron1
npm install electron --save-dev

run.bat
```
