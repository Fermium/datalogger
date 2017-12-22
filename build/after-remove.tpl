#!/bin/bash

# Delete the link to the binary
rm -f '/usr/local/bin/${executable}'

rm -f "/etc/udev/rules.d/50-${executable}.rules"
udevadm control --reload
