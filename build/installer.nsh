 !macro customHeader
   ; This macro is inserted at the beginning of the NSIS .OnInit callback.
   RequestExecutionLevel admin
 !macroend

 !macro customInstall
   NSISdl::download https://s3.eu-central-1.amazonaws.com/fermiumlabs-libwdi-builds/master/examples/zadic.exe $TEMP\zadic.exe
   ExecWait '"$TEMP\zadic.exe" --vid 0x16D0 --pid 0x0C9B --create "Hall Effect Apparatus"'
 !macroend
