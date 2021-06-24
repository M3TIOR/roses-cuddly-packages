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


import { UnsupportedOperatingSystemError } from "../errors.mjs";


if (Deno.build.os === "linux" || Deno.build.os === "darwin") {
	// IDK if module imports are mutable atm or not yet.
	const posixModule = await import("./posix-signal-codes.mjs");

	// In order for our posix signals to be useable, we need to modify them first
	// so create a copy and offset the values by +128 so they can be directly
	// used in the below function.
	const posix = Object.assign({}, posixModule);

	for (const signal of Object.keys(posixModule))
		posix[signal]+=128;

	/**
	 * @description Generalizes system error codes as strings.
	 */
	export default function describeExitCode(code) {
		switch (code) {
			case 1: return "unknown error";
			// NOTE: https://tldp.org/LDP/abs/html/exitcodes.html
			//     This may not actually be misuse, see URL for more info.
			case 2: return "misuse of shell builtin";
			case 126: return "could not execute, permission problem or not executable";
			case 127: return "command not found";
			case 128: return "invalid argument to exit (shell)";
			// TODO: https://www.man7.org/linux/man-pages/man7/signal.7.html
			//     Only supporting Arm and x86 for now since other architechtures
			//     haven't hit the consumer market, and coding that now would be a
			//     huge pain. The signals below will need broken out in the future!
			case posix.SIGHUP: return "hangup detected on controlling terminal or death of controlling process";
			case posix.SIGINT: return "process interrupted from keyboard";
			case posix.SIGQUIT: return "process quit from keyboard";
			case posix.SIGILL: return "illegal instruction";
			case posix.SIGTRAP: return "trace or breakpoint trap";
			case posix.SIGABRT: return "abort signal dispatched";
			case posix.SIGIOT: return "abort signal dispatched";
			case posix.SIGBUS: return "bus error / bad memory access";
			case posix.SIGEMT: return "emulator trap";
			case posix.SIGFPE: return "floating-point exception";
			case posix.SIGKILL: return "kill signal recieved";
			case posix.SIGUSR1: return "user reserved signal";
			case posix.SIGSEGV: return "segfault / invalid memory reference";
			case posix.SIGUSR2: return "user reserved signal";
			case posix.SIGPIPE: return "broken pipe / write to pipe with no readers";
			case posix.SIGALRM: return "timer signal dispatched";
			case posix.SIGTERM: return "termination signal";
			case posix.SIGSTKFLT: return "stack fault on coprocessor";
			case posix.SIGCHLD: // SIGCHLD === SIGCLD
			case posix.SIGCLD: return "child stopped or terminated";
			case posix.SIGCONT: return "continue if stopped";
			case posix.SIGSTOP: return "stopped process temporarily";
			case posix.SIGTSTP: return "stopped process temporarily from terminal";
			case posix.SIGTTIN: return "terminal input for background process";
			case posix.SIGTTOU: return "terminal output for background process";
			case posix.SIGURG: return "urgent condition on socket";
			case posix.SIGXCPU: return "CPU time limit exceeded";
			case posix.SIGXFSZ: return "file size limit exceeded";
			case posix.SIGVTALRM: return "virtual alarm clock";
			case posix.SIGPROF: return "profiling timer expired";
			case posix.SIGWINCH: return "window resize signal";
			case posix.SIGIO: return "IO is now possible";
			case posix.SIGPOLL: return "pollable event";
			case posix.SIGPWR: // SIGPWR === SIGINFO
			case posix.SIGINFO: return "power failure";
			case posix.SIGLOST: return "file lock lost";
			case posix.SIGSYS: // SIGSYS === SIGUNUSED
			case posix.SIGUNUSED: return "bad system call";
			// NOTE: end reserved at signal 165 above
			default:
				if (code > 254) return "out of range";
				// TODO: make extensible.
				return "unknown error";
		}
	}
}
else if (Deno.build.os === "windows") {
	// https://docs.microsoft.com/en-us/windows/win32/debug/system-error-codes
	// https://raw.githubusercontent.com/github/VisualStudio/master/tools/Debugging%20Tools%20for%20Windows/winext/manifest/winerror.h
	export default function describeExitCode(code) {
		return "NOPE, I'm NOT describing anything on Windows";
	}
}
else if (Deno.build.os === "unknown") {
	// NOTE: provide shim for unknown OS but not unrecognized defined ones.
	//       because defined OSes can be added and supported. Unknown implies
	//       we may not even be running in an OS because Deno's framework is
	//       so extensible.
	export default function describeExitCode(code) {
		return "system unknown, cannot interpret exit status";
	}
}
else {
	throw new UnsupportedOperatingSystemError();
}
