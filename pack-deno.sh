#!/bin/sh -e
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

add_compiler_target() { return rustup target add $1; }
remove_compiler_target() { return rustup target remove $1; }
build_target() {
	return cargo install --root $BUILD_DIR --target $1 --no-track deno;
}
fetch_target() {
	curl \
		--fail \
		--location \
		--progress-bar \
		--output $BUILD_DIR/deno.zip \
		https://github.com/denoland/deno/releases/latest/download/deno-${1}.zip;

	unzip -d $BUILD_DIR -o $BUILD_DIR/deno.zip;
	mv -u $BUILD_DIR/deno ./deno/$1;
	#chmod +x ./deno/;
	rm $BUILD_DIR/deno.zip;
}

pack-deno(){
	# We're going to need a directory to containerize our build files.
	# NOTE: don't make local because our other functions need it.
	BUILD_DIR=`mktemp -d deno-pack-`;

	# NOTE: append to this list if you want to add more builds.
	local TARGET_MATCHERS;
	TARGET_MATCHERS="pc-windows-msvc $TARGET_MATCHERS";
	TARGET_MATCHERS="unknown-linux-gnu $TARGET_MATCHERS";
	# TODO: Add android support. (That may be more complicated than the above.)

	# Fetch all binaries built by the Deno team; outsources some build overhead.
	# This is itemized for easy additions / adjustments in the future.
	fetch_target x86_64-pc-windows-msvc;
	fetch_target x86_64-apple-darwin;
	fetch_target aarch64-apple-darwin;
	fetch_target x86_64-unknown-linux-gnu;

	# TODO: break out into strategy options for deployment. My current system
	#       only has 3GiB of space left in the main Ext4 partition. Which means
	#       I can't even compile a single target. I want to download all targets
	#       at once, then do all builds, and remove unnecessary things after, but
	#       my current system means I need to install build and remove, in
	#       batches to sucessfully build everything from here.
	if type rustup && type cargo; then
		# Verify we have the build dependencies first.
		while read RAW_OUTPUT; do
			# Sanitize target for installed.
			local TARGET; TARGET="${RAW_OUTPUT% (installed)}";
			local IS_INSTALLED; IS_INSTALLED="false";
			local MATCH_TRIPPLE;

			MATCH_TRIPPLE="${TARGET#*-}"; # Sanitize arch
			MATCH_TRIPPLE="${MATCH_TRIPPLE%abi64}"; # Sanitize abi64
			MATCH_TRIPPLE="${MATCH_TRIPPLE%eabi*}"; # Sanitize eabi and hf for arm.

			# Find installed targets
			if test -e $BUILD_DIR/$TARGET; then
				# TODO: maybe add a notice for this.
				continue; # skip building existing targets
			elif test "$TARGET" != "$RAW_OUTPUT"; then
				# When we have a build target installed, we don't need to download.
				IS_INSTALLED="true";
			fi;

			local IFS; IFS=":"; for $MATCHER in $TARGET_MATCHERS; do
				if test "$MATCH_TRIPPLE" = "$MATCHER"; then
					if ! IS_INSTALLED; then add_compiler_target "$TARGET"; fi;
					build_target "$TARGET";
					if ! IS_INSTALLED; then remove_compiler_target "$TARGET"; fi;
				fi;
			done;
		done < <(rustup target list);
	else
		# TODO: Instruct the user to get rust and add it to their path.
		#       Or something more helpful.
		echo;
	fi;


	# When done, re-zip everything into a single distributable container.
	zip deno-pack.zip $BUILD_DIR/*;
	unset BUILD_DIR;
}

pack-deno $@;
