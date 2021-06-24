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

// TODO: curses UI.
import parseArgs from "https://deno.land/std@0.86.0/flags/mod.ts";
import * as log from "https://deno.land/std@0.89.0/log/mod.ts";
import os from "./os.mjs";

await log.setup({
	handlers: {
		console: new log.handlers.ConsoleHandler("DEBUG"),

		file: new log.handlers.FileHandler("WARNING", {
			filename: "./log.txt",
			// you can change format of output message using any keys in `LogRecord`.
			formatter: "{levelName} {msg}",
		}),
	},

	loggers: {
		// configure default logger available via short-hand methods above.
		default: {
			level: "INFO",
			handlers: ["console", "file"],
		},

		natives: {
			level: "WARNING",
			handlers: ["console", "file"],
		},

		installers: {
			level: "WARNING",
			handlers: ["console", "file"],
		},
	},
});

const requiredPackages = [
	// TODO: configure basic packages to make the environment work how you want.
	// Known needed: go/golang, git, bash/posix shell,
	// Order: posix shell, git, go,
];
