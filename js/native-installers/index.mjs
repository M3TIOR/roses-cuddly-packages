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

import bake from "../helpers/natives.mjs";

export function getNativeInstallerForOS(systemName) {
	switch (systemName) {
		case "windows":
			// I considered using Chocolatey initially because it's more secure.
			// They enforce package signing, scoop does not. But scoop supports
			// more packages, is decentralized by nature, and installs packages
			// to the user folders by default. Which prevents me from needing the
			// hacky workaround or Admin privlege for Chocolatey.
			//
			// To be clear, it does support signing, but it's up to the authors
			// of packages to use that feature, which can be overlooked when
			// inexperienced folks submit packages. Also packages aren't guaranteed
			// to be configured properly because very few people do audits as far
			// as I'm aware.
			_bindNative("scoop");
		break;
		// NOTE: I don't see myself ever using MacOS for any reason other
		//       unit testing cross platform applications. So I'm leaving
		//       it unconfigured for now.
		case "ubuntu":
			// Not mapping this for now, because ubuntu uses Snap by default which
			// acts too much like a virus for me. In other words, I don't plan to
			// use Ubuntu any time soon if I can help it. Distros based off it,
			// maybe. But not plain Ubuntu. Fuck Canonical.
			throw new NotImplementedError();
		break;
		case "galliumos":
		case "linuxmint":
		case "mint":
		case "debian":
			_bindNative("apt-get");
		break;
		default:
			throw new NotImplementedError();
	}
}

_bindNative(manager) {
	for (const program of Object.keys(native.installers)) {
		if (manager === program)
			return this.manager = native.installers[program];
	}

	throw new NotImplementedError();
}
