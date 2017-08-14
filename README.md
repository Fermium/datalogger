# datalogger

# Debugging

## DevTools

Toggle DevTools.

- macOS: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

### Reload

Force reload the window.

- macOS: <kbd>Cmd</kbd> <kbd>R</kbd> or <kbd>F5</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>R</kbd> or <kbd>F5</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>R</kbd> or <kbd>F5</kbd>

### Element Inspector

Open DevTools and focus the Element Inspector tool.

- macOS: <kbd>Cmd</kbd> <kbd>Shift</kbd> <kbd>C</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>C</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>C</kbd>

# developing

Please use included Vagrant images:
* ubuntu 
* ubuntu_desktop
* windows
* arch (still not working)


### To avoid node-gyp rebuild to fail

* Run PowerShell as administrator and npm install -g windows-build-tools
* Add python.exe to your path (should be in %UserProfile%.windows-build-tools\python27)
* npm config set python python2.7
* npm config set python %UserProfile%\.windows-build-tools\python27\python.exe
* set VCTargetsPath="C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\v140"
