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

import { readLines, BufReader } from "https://deno.land/std@0.89.0/io/bufio.ts";
import { getLogger } from "https://deno.land/std@0.90.0/log/mod.ts";
import { SubprocessError } from "../errors.mjs";


// This should get the installer logger instantiated in the main module.
const logger = getLogger("natives");

async function logStream(cmd, stream, to = logger.info) {
	for (let line of readlines(stream)) to(`${cmd}:${line}`);
}

export default function bake(cmd){
	// TODO: look for the command in the PATH and throw error if not found.
	return async function() {
		const runOptions = {cmd, stdout:"piped", stderr:"piped"};
		// NOTE: can throw NotFound
		const p = Deno.run(runOptions);

		const stdout = new BufReader(p.stdout);
		const stderr = new BufReader(p.stderr);

		// Debug on stdout. Since we shouldn't otherwise need to see it.
		logStream(cmd[0], stdout, logger.debug);
		// Warn on stderr output, because it's trying to communicate some
		// kind of issue.
		logStream(cmd[0], stderr, logger.warning);

		// Throw error on failure, which can be either critical or ok.
		// It depends on the context, should log conditionally.
		if (await p.status() !== 0)
			throw SubprocessError.from(runOptions, p);
		else
			p.close();
	};
};
