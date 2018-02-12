#!/bin/bash

# Link to the binary
ln -sf '/opt/${productFilename}/${executable}' '/usr/local/bin/${executable}'

# Add products to the usb permissions
echo "SUBSYSTEMS==\"usb\", ATTRS{idVendor}==\"16d0\", ATTRS{idProduct}==\"0c9b\", GROUP=\"users\", MODE=\"0666\"" > "/etc/udev/rules.d/50-${executable}.rules"
udevadm control --reload
