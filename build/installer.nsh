!macro customInstall
  
  ; wdi-simple.exe
  ;
  ; -n, --name <name>          set the device name
  ; -f, --inf <name>           set the inf name
  ; -m, --manufacturer <name>  set the manufacturer name
  ; -v, --vid <id>             set the vendor ID (VID)
  ; -p, --pid <id>             set the product ID (PID)
  ; -i, --iid <id>             set the interface ID (MI)
  ; -t, --type <driver_type>   set the driver to install
  ;                            (0=WinUSB, 1=libusb0, 2=libusbK, 3=custom)
  ; -d, --dest <dir>           set the extraction directory
  ; -x, --extract              extract files only (don't install)
  ; -c, --cert <certname>      install certificate <certname> from the
  ;                            embedded user files as a trusted publisher
  ;     --stealth-cert         installs certificate above without prompting
  ; -s, --silent               silent mode
  ; -b, --progressbar=[HWND]   display a progress bar during install
  ;                            an optional HWND can be specified
  ; -l, --log                  set log level (0 = debug, 4 = none)
  ; -h, --help                 display usage
  
  DetailPrint "Running automatic driver installation..."
  nsExec::ExecToLog '"$INSTDIR\drivers\wdi-simple.exe" --vid 0x16D0 --pid 0x0C9B --name "Hall Effect Apparatus" --manufacturer "LabTrek srl" --dest "$INSTDIR\drivers\labtrek\ltk-hall" --progressbar=$HWNDPARENT'
!macroend
