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

import * as semver from "https://raw.githubusercontent.com/justjavac/deno-semver/master/mod.ts";


const utf8 = new TextDecoder();

let releaseData;
if (Deno.build.os === "windows"){
	releaseData={
		ID:"windows",
		ID_LIKE:[],
		// TODO: figure out how to fetch windows version.
		VERSION: semver.coerce("v2");
	};
}
else if (Deno.build.os === "darwin"){
	releaseData={
		ID:"darwin",
		ID_LIKE:[],
		// TODO: figure out how to fetch MacOS version.
		VERSION: semver.coerce("v2");
	}
}
else if (Deno.build.os === "linux"){
	try {
		const releaseFile = Deno.openSync("/etc/os-release", {read: true});
		let releaseFileContent = Deno.readAll(releaseFile);
		Deno.close(releaseFile.rid);

		releaseFileContent = utf8.decode(releaseFileContent);
		const objectSeed = releaseFileContent.split("\n").map((e)=>e.split("="));
		const releaseData = Object.fromEntries(objectSeed);
	}
	catch(e) {
		releaseData = {
			ID:"unknown", ID_LIKE:"unknown",
		};
	}
	finally {
		// Post Process os-release metadata.
		releaseData.ID_LIKE = releaseData.ID_LIKE.split(" ");
		releaseData.VERSION = semver.coerce(releaseData.VERSION);
	}
}

// Final steps.
releaseData.ARCH = Deno.build.arch;

export default releaseData;
