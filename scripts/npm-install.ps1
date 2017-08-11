npm install -g windows-build-tools --add-python-to-path true
[Environment]::SetEnvironmentVariable("PYTHON", "$env:userprofile\.windows-build-tools\python27\python.exe", "Machine")
refreshenv
