---
title: Building self-contained binaries
type: docs
---

# Building self-contained binaries

Starting with Hereditas 0.2, in addition to generating a set of files to be served via HTTP, you can also build a self-contained binary that can be distributed as an app without further dependencies. This binary launches a local web server, and it contains and serves all of your Hereditas box, including the (encrypted) files.

The [`hereditas pack`]({{< relref "/cli/pack.md" >}}) command, run inside your Hereditas working directory, automatically builds binaries for Windows (32-bit and 64-bit), macOS, and Linux (amd64, i386, arm64, armv7).

## Requirements

There are a few requirements before you can run the `hereditas pack` command (the CLI will check them for you too):

1. You need to have the Go compiler installed in your laptop, at least version 1.13.
1. You need to have packr2 installed in your laptop and available in your `PATH`; you can fetch it with `go get -u github.com/gobuffalo/packr/v2/packr2` or you can get a [pre-compiled binary](https://github.com/gobuffalo/packr/releases).
1. The URL `http://localhost:8080` must be allowed for your Hereditas box. You can do that with `hereditas url:add -u http://localhost:8080` (and then `hereditas auth0:sync`).
1. You must have already built your Hereditas box. That is, you must have run the `hereditas build` command.

## Build the binaries

Run the [`hereditas pack`]({{< relref "/cli/pack.md" >}}) command to automatically build the binaries; this can take a couple of minutes.

```sh
hereditas pack
```

The binaries will be placed in the `_bin` folder:

```sh
~/hereditas $ ls _bin
hereditas-box-linux-386
hereditas-box-linux-amd64
hereditas-box-linux-arm64
hereditas-box-linux-armv7
hereditas-box-macos
hereditas-box-win32.exe
hereditas-box-win64.exe
```

Pick the right binary for your system(s) and distribute them in any way you see fit.

> **macOS and Gatekeeper:** Hereditas does not sign the macOS binary, as that requires a developer certificate from Apple. The app you compile will run in your Mac without issues, but if you distribute it to other people, Gatekeeper might refuse to run it as it's unsigned. Read more about Gatekeeper in the [Apple support site](https://support.apple.com/en-us/HT202491).

## Running the self-contained app

Most users will be able to open your Hereditas box by double-clicking on the binary.

The app runs in the command line, and it should automatically open a terminal if you launch it through your operating system's shell.

The app launches a web server listening on `127.0.0.1` and on port `8080`. It will then automatically open the user's default web browser (if possible) with the URL `http://localhost:8080`.
