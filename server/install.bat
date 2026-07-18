rem "npm install --global windows-build-tools"
rem "This command is error exit."
rem "But vs_BuildTools.exe is downloaded to C:\Users\Yours\.windows-build-tools\vs_BuildTools.exe"
rem "Execute vs_BuildTools.exe and Install msvs_tools."

rem "About Python, Download Python 3 and Install."
rem "Don't Install Python 2.7.15.msi in same directory of vs_BuildTools.exe"

rem "npm config --global set msvs_version 2017"

rem "npm config --global set python python3.14.6"

pip install setuptools

npm install --global node-gyp

npm install ffi-napi ref-napi ref-array-napi ref-struct-napi
