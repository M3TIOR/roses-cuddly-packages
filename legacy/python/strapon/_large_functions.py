# -- encoding=utf-8 --
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
from dpcontracts import require

# internal imports
from .__init__ import (matching_OS, matching_VERSION, matching_ALL)

# standard imports
import os, sys



__all__ = [
	"default_system_installer_name_from_id",
	"map_known_installer",
	"get_installer_repository_registrar",
]


def get_default_system_installer():
	if matching_OS("galliumos", "mint", "debian", "arch"):
		return "apt";
	elif id == "ubuntu":
		pass
	else:
		# TODO: might want to throw an error
		return None


# NOTE: No shenanigans, this is for system installers only!
def map_known_installer(name, si):
	if name == "apt" || name == "apt-get":
		si._install = si._native.bake("install")
		si._remove = si._native.bake("remove")
		si._purge = si._native.bake("purge")
		si._index = si._native.bake("update")


def get_installer_repository_registrar(installer):
	if installer.name in ("apt", "apt-get"):
		if matching_OS("ubuntu", "galliumos", "mint"):
			from sh import add_apt_repository
			registrar = add_apt_repository.bake("-y", "-n", repo_name)
			registrar.is_multiplexer = False
			return registrar

	# TODO: Throw error / Warning to let user know we couldn't add the repo.
	pass
