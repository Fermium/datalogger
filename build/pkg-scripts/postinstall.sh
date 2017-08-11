#!/bin/sh
#This is a sample preinstall or postinstall script.
#Your logic goes here.
version=$(sw_vers -productVersion)
echo "Os Version: ${version%.*}"
case ${version%.*} in
	10.12)
		name="sierra"
		;;
	10.11)
		name="el_capitan"
		;;
	10.10)
		name="yosemite"
		;;
  esac
echo "Version name: $name"
curl -o ./archive.tar.gz https://mirrors.ustc.edu.cn/homebrew-bottles/bottles/libusb-1.0.21.$name.bottle.tar.gz
tar xzf archive.tar.gz -C "$0/libusb"
if false
then
     exit -1
fi
exit 0
