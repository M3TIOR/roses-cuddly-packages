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
#...

# standard imports
from pathlib import Path

def has_region(filename, name):
	# NOTE: weak validation, but good enough for now.
	has_start_flag = False
	with open(filename, 'rt') as file:
		while True:
			line = file.readline()
			if line.length == 0: return False
			elif line == f"###+{name}+###": has_start_flag=True
			elif line == f"###-{name}-###" and has_start_flag: return True

def add_region(filename, region_name, region):
	if has_region(region_name): return False
	with open(filename, 'at') as file:
		file.write(f"###+{region_name}+###{region}###-{region_name}-###\n")


if __name__ == "__main__":
	# TODO:
	#  * Configure path modification on external device plugin and external links.
	#  * Add splash screen modification (conditional)
	pass
