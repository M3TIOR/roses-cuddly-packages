/**
 * Copyright 2020 Ruby Allison Rose (aka. M3TIOR)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { NotImplementedError, SubprocessError } from "./errors.mjs";
import { readLines, BufReader } from "https://deno.land/std@0.89.0/io/bufio.ts";
import { getColorEnabled, bgRed, yellow } from "https://deno.land/std@0.89.0/fmt/colors.ts";
import { getLogger } from "https://deno.land/std@0.90.0/log/mod.ts";

import * as native from "./helpers/native_installers.mjs";
import { isAdmin } from "./helpers/helpers.mjs";
import os from "./os.mjs";


// This should get the installer logger instantiated in the main module.
const logger = getLogger("installers");


// Package architecture
class Package {
	static location = Object.freeze({
		system: 0,
		user: 1,
		// Install to user if not available at system level.
		userIfAbsentInSystem: 3,
		// Install to both if possible.
		userAndTrySystem: 4,
	});

	constructor(name, location, metadata) {
		this.name = name;
		if (location) this.to = location;
		else this.to = Package.location.systemOverUser;
		this.meta = metadata;
	}

	static from(obj) {
		// TODO: make this more error tollerant.
		if (typeof obj === "string")
			return new Package(obj);
		else
			return new Package(obj.name, obj.location);
	}
}

class Installer {
	// NOTE: JS doesn't require args, so these functions don't need to accept any.
	async install(level="local") { throw new NotImplementedError(); }
	async remove(level="local") { throw new NotImplementedError(); }
	async purge(level="local") { throw new NotImplementedError(); }
	async update() { throw new NotImplementedError(); }
	async query(level="local") { throw new NotImplementedError(); }
}

class PackageInstaller extends Installer {
	constructor(name) {
		if (!name) this._bindOS(os);
		else this._bindNative(name);

		this.install = this._call.bind(this, "install");
		this.remove = this._call.bind(this, "remove");
		this.update = this._call.bind(this, "update");
		this.purge = this._call.bind(this, "purge");
		this.query = this._call.bind(this, "query");
	}



	// getName() {
	// 	return this.manager.name;
	// }

	resolve(packages) {
		// TODO: Resolve packages to install with only those specified,
		//      write a configuration list of all dependencies not managed
		//      by the operating system to the system local appdata,
		//      read existing package configuration from that list to ensure
		//      future packages don't install duplicates where possible.
		//
		// NOTE: Nevermind, this should be handled by the package managers.
		//       Which means I'll have to implement that for apt-get.

		const system = new Set();
		const user = new Set();
		for (const package in packages) {
			switch(package.to) {
				case Package.location.userIfAbsentInSystem:
					if (this.query(package, "system")) continue;
				case Package.location.user:
					user.add(package);
				break;;
				case Package.location.userAndTrySystem:
					user.add(package);
				case Package.location.system:
					system.add(package);
			}
		}

		return [system, user];
	}

	async _call(cmd, packages, level="local"){
		let executor = this.manager[level][cmd];
		let args =


		if (typeof executor === "function")
			return executor(args);

		

		// native.close should still be run after status await.
		return await native.status() && native.close();
	}
}

class StandaloneWebInstaller extends Installer {
	constructor(url){

	}
}

class GitInstaller extends Installer {
	constructor(url) {

	}
}
