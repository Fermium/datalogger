##################### DESKTOP SHORTCUTS
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Vagrant.lnk")
$Shortcut.TargetPath = "C:\vagrant\"
$Shortcut.Save()

$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Powershell.lnk")
$Shortcut.TargetPath = "%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe"
$Shortcut.Save()

$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Cmd.lnk")
$Shortcut.TargetPath = "%windir%\system32\cmd.exe"
$Shortcut.Save()

##################### INSTALL CHOCOLATEY

$ChocoInstallPath = "$env:SystemDrive\ProgramData\Chocolatey\bin"

# check if chocolatey exists					
 if (!(Test-Path $ChocoInstallPath)) {
     iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))
 }


##################### INSTALL SW

# nodejs
cinst -y nodejs-lts
refreshenv
node -v
cinst -y yarn --ignore-dependencies

# Node-gyp required build tools
cinst -y vcbuildtools
cinst -y python2
npm config set msvs_version 2015
refreshenv

# git (required to publish to amazon s3)
cinst -y git.install
