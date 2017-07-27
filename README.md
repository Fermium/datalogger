# datalogger

To avoid node-gyp rebuild to fail

* Run PowerShell as administrator and npm install -g windows-build-tools
* Add python.exe to your path (should be in %UserProfile%.windows-build-tools\python27)
* npm config set python python2.7
* npm config set python %UserProfile%\.windows-build-tools\python27\python.exe
* set VCTargetsPath="C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\v140"
