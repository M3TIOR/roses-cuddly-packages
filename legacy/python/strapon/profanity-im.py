#!/usr/bin/env python3
# Copyright 2020 Ruby Allison Rose (aka. M3TIOR)
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.



# external imports
#...

# internal imports
from . import *

# standard imports
#...



# Call to install/reinstall/uninstall the application via a system native package manager.
@strapon(SystemInstaller.default())
@package("profanity")
# What's really cool about profanity is it's supported on just about
# every mainstream Linux Distro via their *main* package repositories.
class system():
	pass

# Call to build and install the package from source if you're a crazy person.
def source():
	# git clone https://github.com/profanity-im/profanity
	# ./bootstrap.sh
	# ./configure
	# make
	# make install
	# # DEPS
	# automake
	# autoconf
	# autoconf-archive
	# libtool
	# pkg-config
	# OTHER DEPS:
	# libncursesw5-dev
	# libglib2.0-dev
	# libcurl3-dev
	# libreadline-dev
	# libsqlite3-dev
	# # OPTIONAL
	# libnotify-dev            # Desktop notification support
	# libxss-dev               # Desktop idle time autoaway support
	# libotr5-dev              # OTR support
	# libgpgme11-dev           # PGP support
	# libsignal-protocol-c-dev # OMEMO support
	# libgcrypt-dev            # OMEMO support (>= 1.7)
	# libgtk2.0-dev            # Desktop tray icon support
	# python-dev               # Python plugin support
	# libcmocka-dev            # To run tests
	raise NotImplementedError()


# NOTE: defined in __init__.py of the strapon module.
if __name__ == "__main__":
	singleton_CLI(__file__, system_fn=system, source_fn=source)
