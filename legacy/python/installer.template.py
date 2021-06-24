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




# Call to install/reinstall/uninstall the application via an APPIMAGE
#  or other standalone distribution method.
def standalone(installer, namespace):
	raise NotImplementedError()

# Call to install/reinstall/uninstall the application via a system native package manager.
@strapon(SystemInstaller.default())
# @SystemInstaller.register_repository()
@SystemInstaller.stage_package("package_name", os_name="ubuntu", os_version="<=2")
def system(installer, namespace):
	installer.exec(namespace)

# Call to build and install the package from source if you're a crazy person.
def source(installer, namespace):
	raise NotImplementedError()


# NOTE: defined in __init__.py of the strapon module.
if __name__ == "__main__":
	singleton_CLI(__file__, standalone, system, source)
