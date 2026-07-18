<!-- /* vim:set ts=2 sw=2 sts=2 tw=80 et: */ -->
### Coexistence of Windows 64bit Electron and 32bit DLL coded by C on localhost
### Underlying Motivation
(1) AI advises coding with the latest 64bit Electron LTS version.  
(2) But In operational environments, 32-bit DLLs written in C are running stably, making them difficult to discard.  

### System Configuration Diagram
![sysDiagram](https://github.com/user-attachments/assets/88120a95-027f-46e5-8ff0-6a8eac1c2b39)  


### Basic call example 1 from Electron(Client)  
in device1_32.dll, function "sm2cin" is defined as follkkow:
```C
__declspec(dllexport) int sm2cin() {
  return 3;
}
```

DLL call:
```javascript
let adll1 = await ffi_honji_cli(
              "./dll/device1_32.dll",
              {
	              "sm2cin": ["int",[]]
							});
const value = await adll1.ffi_call( "sm2cin");
console.log( "sm2cin()=", value);   // 3
```
This is simply ffi-napi style.

### Basic call example 2 from Electron(Client)  
in device2_32.dll, function "sm2cin" is defined as follow:
```C
__declspec(dllexport) int sm2cin(int a, int b, int* sum) {
  *sum = a + b;
  return 0;
}
```

DLL call:
```javascript
let adll2 = await ffi_honji_cli(
              "./dll/device2_32.dll",
              {
	              "sm2cin": ["int",["int", "int", ["int",1]]]
							});
const value = await adll2.ffi_call( "sm2cin", 1, 2, [0]);
console.log( "sm2cin()=", value);   // 0
console.log( "output arg[2]=", adll2.mojson.xotarg[2]);  // 3
```

### Basic call example 3 from Electron(Client)  
in device3_32.dll, function "sm2cin" is defined as follow:
```C
typedef struct { a:char; b:short; c:int; } TSTRUC;
__declspec(dllexport) int sm2cin( TSTRUC *s, int *sum) {
  *sum = s->a + s->b + s->c;
  return 0;
}
```

DLL call:
```javascript
let adll3 = await ffi_honji_cli(
              "./dll/device3_32.dll",
              {
                "sm2cin": ["int",[{a:"char", b:"short", c:"int"},1], ["int", 1]]
              });
const value = await adll3.ffi_call( "sm2cin", [{a:1, b:2, c:4}], [0]);
console.log( "sm2cin()=", value);
console.log( "output arg[1]=", adll3.mojson.xotarg[1]);  // 7
```

### ffi-napi server setup
(1) Download git for windows and install your pc.  
(2) Download Python3 branch from internet and install your pc.  
(3) Download from archive and Extract node-v16.xx.x-win-x86.zip to any folder.  
(4) Adjust the node v16 startup bat-file in same layer of (3).  
(4-1)node16.bat
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

(5) Download from archive and Extract node-v24.18.0-win-x64 to same layer of (3).  
(6) Adjust the node v24 startup bat-file in same layer of (3).  
(6-1)node24.bat
```bat
@echo off
chcp 65001
set CWD=%~dp0
echo %CWD%
set PATH=%CWD%bin;%CWD%node-v24.18.0-win-x64;%PATH%
cmd
```

(7)Execute node24.bat
```bat
node --version
v24.18.0

npm --version
11.16.0

cd ffi_honji/client/electron1
npm install electron --save-dev

run.bat
```
