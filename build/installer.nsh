
 !macro preInit
   ; This macro is inserted at the beginning of the NSIS .OnInit callback
   NSISdl::download https://s3.eu-central-1.amazonaws.com/fermiumlabs-libwdi-builds/master/examples/zadic.exe $TEMP\zadic.exe
 !macroend

 !macro customInit
    Exec 'elevate "$TEMP\zadic.exe" --vid 0x16D0 --pid 0x0C9B --create "Hall Effect Apparatus" --noprompt'
 !macroend
