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


import { UnsupportedArchitectureError, NotImplementedError } from "../errors.mjs";


/**
 * NOTE: Deno gets build information directly from rustc in the form of triple
 *           <arch><sub>-<vendor>-<sys><abi>
 *       To find supported triples, run `rustc --print target-list`
 *
 * NOTE: Unused signals are set to 0;
 */
const mainArchitechtures = [
	// x86_64 architechtures
	"x86_64", "i386", "i586", "i686",

	// arm architechturess
	"arm", "armebv7r", "armv4t", "armv5te", "armv6", "armv7", "armv7a", "armv7r",
	"armv7s",
];

// See https://www.man7.org/linux/man-pages/man7/signal.7.html for more info.
if (Deno.build.os === "linux") {
	if ([mainArchitechtures].includes(Deno.build.arch)) {
		export const SIGHUP = 1;
		export const SIGINT = 2;
		export const SIGQUIT = 3;
		export const SIGILL = 4;
		export const SIGTRAP = 5;
		export const SIGABRT = 6;
		export const SIGIOT = 6;
		export const SIGBUS = 7;
		export const SIGEMT = 0;
		export const SIGFPE = 8;
		export const SIGKILL = 9;
		export const SIGUSR1 = 10;
		export const SIGSEGV = 11;
		export const SIGUSR2 = 12;
		export const SIGPIPE = 13;
		export const SIGALRM = 14;
		export const SIGTERM = 15;
		export const SIGSTKFLT = 16;
		export const SIGCHLD = 17;
		export const SIGCLD = 0;
		export const SIGCONT = 18;
		export const SIGSTOP = 19;
		export const SIGTSTP = 20;
		export const SIGTTIN = 21;
		export const SIGTTOU = 22;
		export const SIGURG = 23;
		export const SIGXCPU = 24;
		export const SIGXFSZ = 25;
		export const SIGVTALRM = 26;
		export const SIGPROF = 27;
		export const SIGWINCH = 28;
		export const SIGIO = 29;
		export const SIGPOLL = 29;
		export const SIGPWR = 30;
		export const SIGINFO = 0;
		export const SIGLOST = 0;
		export const SIGSYS = 31;
		export const SIGUNUSED = 31;
	}
	else {
		// Not yet implemented.
		throw new NotImplementedError();
	}
}
else if (Deno.build.os === "darwin") {
	// NOTE: this url is the best refference for MacOS's signals architechture atm.
	// https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/signal.3.html
	throw new NotImplementedError();
}
