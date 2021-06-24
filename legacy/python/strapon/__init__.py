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
import semver
from sh import Command
from dpcontracts import require, types

# internal imports
from ._large_functions import *

# standard imports
from importlib import import_module
from argparse import ArgumentParser, REMAINDER as ARG_REMAINDER
from urllib.parse import urlparse
import os, sys, shlex, platform, inspect



__all__ = [
	# All required translated constants.
	"OS_NAME",
	"OS_VERSION",
	"OS_VERSION_ID",
	"OS_VERSION_CODENAME",
	"OS_ID",
	"OS_IDLIKE",
	"OS_UBUNTU_CODENAME",

	# Helpers
	"matching_OS",
	"matching_CPU",
	"matching_VERSION",
	"update_package_repositories",
	"register_system_repository",
	"Installer",
	"singleton_CLI",
]



#CONSTANTS
try:
	OS_NAME = os.environ["NAME"]
	OS_VERSION = os.environ["VERSION"]
	OS_VERSION_ID = os.environ["VERSION_ID"]
	OS_VERSION_CODENAME = os.environ["VERSION_CODENAME"]
	OS_ID = os.environ["ID"]
	OS_IDLIKE = os.environ["ID_LIKE"].split(" ")
	OS_UBUNTU_CODENAME = os.environ["UBUNTU_CODENAME"]
except(Exception):
	# if we didn't get the variables exported via the shell just directly
	# read them out of the os-release file (in case we wind up being run)
	# by the user and not by the shell.
	for line in open("/etc/os-release", "r"):
		assignment_trigger = line.index("=", 1)
		assignment = line[:assignment_trigger]
		# use shlex to parse string since it implements basic posix shell
		value = shlex.split(line[assignment_trigger+1:])[0]
		globals()[f"OS_{assignment}"] = value

	# Special transformations
	if "OS_ID_LIKE" in globals():
		global OS_IDLIKE
		OS_IDLIKE = OS_ID_LIKE.split(" ")
		del OS_ID_LIKE


_nos = (type(None), str)
_os_id_list = OS_IDLIKE.insert(0, OS_ID) if "OS_IDLIKE" in globals() else [OS_ID]


class Installer():
	"""A base class for installer inheritance and standards"""
	# Called the metadta preprocessors because they execute before the
	# final action is made. Not because they happen on instantiation or
	# before the main UI.
	metadata_preprocessors = {}
	metadata = {}
	def __init__(self): raise NotImplementedError()

	# Must implement all of the following to be a valid installer class
	# _install()
	# _remove()
	# _purge()
	# _index()

	def exec(self, namespace):
		for key, function in metadata_preprocessors.items():
			function(self.metadata[key])

		if self.metadata["index_before_action"]:
			self._index()

		action = getattr(self, f"_{namespace.action}")
		action()

class SystemInstaller():
	def __init__(self, name):
		#self._native = import_module(name, package="sh")
		self._native = Command(name)
		map_known_installer(name, self)
		self.registrar = get_installer_repository_registrar(self)

		# Initialize links to metadata handlers
		self.metadata_preprocessors["repositories"] = self._meta_repository_handle
		self.metadata_preprocessors["packages"] = self._meta_package_handle

		# Initialize the metadata structures to make use of the
		# storage_decorator special features.
		self.metadata["repositories"] = []
		# NOTE: (to self)
		#    When building the multi-package UI, make sure to evaccuate this
		#    after it's read. Otherwise the packages will be concattenated into
		#    the install stage on execution.
		self.metadata["packages"] = []
		# NOTE:
		#    handled by the toplevel manager; if indexing is done prior to
		#    execution for the installer, change this flag to False
		self.metadata["index_before_action"] = True


	def __eq__(self, i2):
		return isinstance(i2, SystemInstaller) and self._native == i2._native

	def _meta_repository_handle(self):
		if self.registrar.is_multiplexer:
			self.registrar(*self.metadata["repositories"])
		else:
			for repository in self.metadata["repositories"]:
				self.register_repository(repository)

	def _meta_package_handle(self):
		self._install = self._install.bake(*self.metadata["packages"])
		self._remove = self._remove.bake(*self.metadata["packages"])
		self._purge = self._purge.bake(*self.metadata["packages"])
		self._package_list += self.metadata["packages"]

	@staticfunction
	def default():
		name = get_default_system_installer()
		return SystemInstaller(name)

	# Called when installing a system managed package. If the package is
	# unlikely to be held in the OS native package repositories, use this
	# to add the best known package repository for the app.
	@types(repository=str)
	def add_repository(self, repository):
		self.registrar(repository)
		# Make sure if the flag was unset by the main manager, we
		# reset this flag so the packages which the repository implements
		# can be located upon install.
		self.metadata["index_before_action"] = True

	@types(package=str)
	def add_package(self, package):
		self._install = self._install.bake(package)
		self._remove = self._remove.bake(package)
		self._purge = self._purge.bake(package)

	class register_repository(key_storage_decorator):
		key="repositories"

		@types(package_repository=str)
		def __init__(self, package_repository, **kwargs):
			key_storage_decorator.__init__(self, package_repository, **kwargs)

	class stage_package(key_storage_decorator):
		key="packages"

		@types(package=str)
		def __init__(self, package, **kwargs):
			if "os_name" in kwargs: self.os_name = kwargs["os_name"]
			key_storage_decorator.__init__(self, package, **kwargs)

		def __call__(self, f):
			if hasattr(f, "os_name") and hasattr(f, "fallback_package"):
				if _os_id_list.index(f.os_name) <= _os_id_list.index(self.os_name):
					del f.os_name
					del f.fallback_package
					return
				else:
					self.storage["packages"] = f.fallback_package
					del f.os_name
					del f.fallback_package

			storage_decorator.__call__(self, f)

	class fallback_package(stage_package):
		key="packages"

		# Chains package groups together so that you can
		# accommodate for progenetor OS fallback, and OEM precedence
		def __call__(self, f):
			if hasattr(f, "os_name"):
				if _os_id_list.index(f.os_name) <= _os_id_list.index(self.os_name):
					self.storage.pop("packages")
					return
			else:
				f.os_name = self.os_name

			f.fallback_package = self.storage.pop("packages")


class WebInstaller(Installer):
	def __init__(self, resource, type=None):
		url = urlparse(resource)


class GitInstaller(Installer):
	def __init__(self, repo, branch, build_system=None):
		pass


class decorator():
	"""Base Decorator class for type checking features."""
	# NOTE: add arguments to the init for decorator capture
	def __init__(self, *args, **kwargs): pass
	def __call__(self, f): pass

class storage_decorator(decorator):
	def __init__(self, **kwargs): self.storage = kwargs
	def __call__(self, f):
		if not hasattr(f, "meta"):
			f.meta = {}

		for key, value in self.storage.items():
			if not key in f.meta:
				f.meta[key] = value
			else:
				if isinstance(f.meta[key], list):
					f.meta[key].append(value)
				else:
					f.meta[key] = value

			return f

class key_storage_decorator(storage_decorator):
	key=None

	@types(os_name=_nos, os_version=_nos, cpu=_nos)
	def __init__(self, value, **kwargs):
		global groups
		if group is not None:
			group = f"{callerfile()}-{group}"
			if group in groups:
				if groups.index(kwargs["os_name"]) > groups.index(groups[group]):
					return
				else:
					groups[group] = kwargs["os_name"]
			else:
				groups[group] = kwargs["os_name"]

		function = lambda : self.storage = {self.key: value}
		os_dependent_action(function, **kwargs)

	def __call__(self, f):
		storage_decorator.__call__(self, f)

class strap_on(key_storage_decorator):
	key="installer"

	@require("'installer' must be a type of 'Installer' class.",
		lambda args: isinstance(args.installer, type) and Installer in args.installer.__mro__)
	@types(default=bool)
	def __init__(self, installer_class, *args, default=False, **kwargs):
		installer = None

		depconf = dictionary_extract(kwargs, ("group", "os_name", "os_version", "cpu"))

		if default:
			if hasattr(installer_class, "default"):
				installer = installer_class.default()
			else:
				pass # TODO: throw error no default method for this class
		else:
			installer_class(*args, **kwargs)


		key_storage_decorator.__init__(self, installer, **depconf)

	def __call__(self, f):
		key_storage_decorator.__call__(self, f)

		if "installer" in self.storage and not "installer" in f.meta:
			target = self.storage["installer"]
			target.metadata = f.meta
			return lambda *args, **kwargs : f(target, *args, **kwargs)
		else:
			return f

@require("'targets' must be strings.", lambda args : all(isinstance(v, str) for v in args.targets))
def matching_OS(*targets):
	for id in target_list:
		if id in _os_id_list:
			return True;

	return False;

@types()
def matching_CPU(*cpu_arch_list):
	return platform.processor() in cpu_arch_list

def matching_VERSION(*version_list):
	# NOTE: parse cannonical and version codenames together
	pass

def matching_ALL(**kwargs):
	return os_dependent_action(lambda : True, **kwargs)


def os_dependent_action(action, os_name=None, os_version=None, cpu=None):
	matches = (True, True, True)

	if os_name is not None: matches[0] = matching_OS(os_name)
	if os_version is not None: matches[1] = matching_VERSION(os_version)
	if cpu is not None: matches[2] = matching_CPU(cpu)

	if all(matches):
		action()

def dictionary_extract(d, keys):
	newd = {}
	for key in keys:
		newd[key] = d.pop(key)

	return newd

def callerfile():
	frame = inspect.stack()[1]
	filename = frame[0].f_code.co_filename
	return filename

def add_installer_cli_stub(parser):
	subparsers = parser.add_subparsers(
		title="actions",
		description="Actions to be taken for the designated package format.",
		dest="action",
		required=True,
	)
	install = subparsers.add_parser("install")
	remove = subparsers.add_parser("remove")
	purge = subparsers.add_parser("purge")

def singleton_CLI(file, standalone_fn=None, system_fn=None, source_fn=None):
	parser = ArgumentParser(
		name=f"strapon.{os.path.basename(file)[:-3]}",
		description="A bundled package from the yadm dotfiles host.",
	)

	subparsers = parser.add_subparsers(
		title="format",
		description="package installation format options",
		dest="format",
		required=True,
	)

	if standalone_fn is not None:
		standalone_parser = subparsers.add_parser("standalone",
			help="Use the standalone format of this application (sometimes newer)")
		add_installer_cli_stub(standalone_parser)

	if system_fn is not None:
		system_parser = subparsers.add_parser("system",
			help="Use the built-in system format of this application (most stable)")
		add_installer_cli_stub(system_parser)

	if source_fn is not None:
		source_parser = subparsers.add_parser("source",
			help="Use the source format of this application (bleeding edge / last resort)")
		add_installer_cli_stub(source_parser)

	args = parser.parse_args()

	target = local()[f"{args.format}_fn"]
	if target is not None:
		target(args)
	else:
		raise f"Unknown command '{args.format}'."
