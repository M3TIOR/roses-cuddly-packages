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

import { SubprocessError, NotImplementedError } from "./errors.mjs";

/**
 * NOTE: this may not be the best algorithm after all. Dispite it's low memory
 *       profile, it may misreport errors.
 */
async function getPosixUID(){
	// Hopefully Deno will make this a runtime feature in the future, because
	// relying on an external process for this sucks.
	const runOptions = { cmd: ["id", "-u"], stdout: "piped" };
	const p = Deno.run(runOptions);

	// Unix UIDs are generally uint32 size. So the max character length when
	// printed in base ten, is 10. Add one to that for the appended newline.
	// Horray for fixed output size.
	const buff = new Uint8Array(11);

	// Double check that our status code is zero. Throw error early otherwise.
	const status = await p.status();
	if (status !== 0)
		throw await SubprocessError.from(runOptions, p);

	// Only need to wait for the buffer to finish populating then we can move on.
	await p.stdout.read(buff);

	// Do cleanup of process object.
	p.close(); // I'm going to assume this cleans up and closes both stderr/out

	const decoder = new TextDecoder("utf-8");
	const buffstr = decoder.decode(buff);
	const ind = buffstr.indexOf("\n");

	return parseInt(buffstr.slice(0,ind));
}


export async function isAdmin(){
	if (Deno.build.os === "windows") {
		throw new NotImplementedError();
	}
	// Darwin and Linux are both posix compliant, which means they should both
	// have the `id` command in the proper format.
	else if (Deno.build.os === "darwin") { return (await getPosixUID()) > 0; }
	else if (Deno.build.os === "linux") { return (await getPosixUID()) > 0; }
}
