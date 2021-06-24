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

import describeExitCode from "./helpers/describe-exit-code.mjs";

export class NotImplementedError extends Error {
	constructor() {
		super();
		this.name = "NotImplementedError";
		this.message = "This is unimplemented and must be overridden by the inheriting class.";
	}
}

export class UnsupportedOperatingSystemError extends Error {
	constructor() {
		super();
		this.name = "UnknownOperatingSystemError";
		this.message = `Unrecognized operating system '${Deno.build.os}'`;
	}
}

export class UnsupportedArchitectureError extends Error {
	constructor() {
		super();
		this.name = "UnsupportedArchitectureError";
		this.message = `Unrecognized binary architecture '${Deno.build.arch}'`;
	}
}

/**
 * NOTE: requires the process
 */
export class SubprocessError extends Error {
	constructor() {
		super();
		this.name = "SubprocessError";
		this.message = null;
		this.exitCode = null;
		this.stdout = null;
		this.stderr = null;
	}
	// Requires custom initialize method because this needs access to
	// async process methods.
	static async from(runOptions, process) {
		const err = new SubprocessError();
		// Status should be awaited upon first, then grab all the output data.
		this.exitCode = await process.status();

		if (runOptions.stdout === "piped") this.stdout = await process.output();
		if (runOptions.stderr === "piped") this.stderr = await process.stderrOutput();

		// Close process pipes and clean up.
		this.process.close();

		try {
			this.message = `'${runOptions.cmd.join("\n")}' failed with code ` +
			               `[${this.exitCode}]( ${describeExitCode(this.exitCode)} )`;
		}
		catch(err) {
			if ( err instanceof NotImplementedError )
				this.message = `'${runOptions.cmd.join("\n")}' failed with unknown error.`;
			else
				throw err;
		}

		return err;
	}
}
