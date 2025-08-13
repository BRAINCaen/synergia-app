10:56:01 AM: build-image version: 71a98eb82b055b934e7d58946f59957e90f5a76f (noble)
10:56:01 AM: buildbot version: 72ba091da8478e084b7407a21cd8435e7ecab808
10:56:01 AM: Fetching cached dependencies
10:56:01 AM: Starting to download cache of 243.7MB (Last modified: 2025-08-12 23:21:28 +0000 UTC)
10:56:03 AM: Finished downloading cache in 1.88s
10:56:03 AM: Starting to extract cache
10:56:08 AM: Finished extracting cache in 5.196s
10:56:08 AM: Finished fetching cache in 7.135s
10:56:08 AM: Starting to prepare the repo for build
10:56:08 AM: Preparing Git Reference refs/heads/feature/modular-architecture
10:56:09 AM: Custom build path detected. Proceeding with the specified path: 'react-app'
10:56:09 AM: Custom publish path detected. Proceeding with the specified path: 'react-app/dist'
10:56:09 AM: Custom build command detected. Proceeding with the specified command: 'npm install && npm run build'
10:56:10 AM: Starting to install dependencies
10:56:10 AM: Started restoring cached python cache
10:56:10 AM: Finished restoring cached python cache
10:56:10 AM: Started restoring cached ruby cache
10:56:11 AM: Finished restoring cached ruby cache
10:56:11 AM: Started restoring cached go cache
10:56:11 AM: Finished restoring cached go cache
10:56:12 AM: v22.18.0 is already installed.
10:56:12 AM: Now using node v22.18.0 (npm v10.9.3)
10:56:12 AM: Enabling Node.js Corepack
10:56:13 AM: Started restoring cached build plugins
10:56:13 AM: Finished restoring cached build plugins
10:56:13 AM: Started restoring cached corepack dependencies
10:56:13 AM: Finished restoring cached corepack dependencies
10:56:13 AM: No npm workspaces detected
10:56:13 AM: Started restoring cached node modules
10:56:13 AM: Finished restoring cached node modules
10:56:13 AM: npm warn config production Use `--omit=dev` instead.
10:56:13 AM: Installing npm packages using npm version 10.9.3
10:56:13 AM: npm warn config production Use `--omit=dev` instead.
10:56:13 AM: up to date in 676ms
10:56:13 AM: npm packages installed
10:56:13 AM: npm warn config production Use `--omit=dev` instead.
10:56:14 AM: Successfully installed dependencies
10:56:14 AM: Starting build script
10:56:14 AM: Detected 1 framework(s)
10:56:14 AM: "vite" at version "4.5.14"
10:56:14 AM: Section completed: initializing
10:56:16 AM: ​
10:56:16 AM: Netlify Build                                                 
10:56:16 AM: ────────────────────────────────────────────────────────────────
10:56:16 AM: ​
10:56:16 AM: ❯ Version
10:56:16 AM:   @netlify/build 35.0.5
10:56:16 AM: ​
10:56:16 AM: ❯ Flags
10:56:16 AM:   accountId: 673cb83c3496b504a130c717
10:56:16 AM:   baseRelDir: true
10:56:16 AM:   buildId: 689c531b8f85960008ca91f3
10:56:16 AM:   deployId: 689c531b8f85960008ca91f5
10:56:16 AM: ​
10:56:16 AM: ❯ Current directory
10:56:16 AM:   /opt/build/repo/react-app
10:56:16 AM: ​
10:56:16 AM: ❯ Config file
10:56:16 AM:   /opt/build/repo/netlify.toml
10:56:16 AM: ​
10:56:16 AM: ❯ Context
10:56:16 AM:   production
10:56:16 AM: ​
10:56:16 AM: build.command from netlify.toml                               
10:56:16 AM: ────────────────────────────────────────────────────────────────
10:56:16 AM: ​
10:56:16 AM: $ npm install && npm run build
10:56:16 AM: npm warn config production Use `--omit=dev` instead.
10:57:14 AM: up to date, audited 471 packages in 58s
10:57:14 AM: 134 packages are looking for funding
10:57:14 AM:   run `npm fund` for details
10:57:15 AM: 12 moderate severity vulnerabilities
10:57:15 AM: To address issues that do not require attention, run:
10:57:15 AM:   npm audit fix
10:57:15 AM: To address all issues (including breaking changes), run:
10:57:15 AM:   npm audit fix --force
10:57:15 AM: Run `npm audit` for details.
10:57:15 AM: npm warn config production Use `--omit=dev` instead.
10:57:15 AM: > synergia-app@3.5.2 build
10:57:15 AM: > vite build --mode production
10:57:15 AM: NODE_ENV=production is not supported in the .env file. Only NODE_ENV=development is supported to create a development build of your project. If you need to set process.env.NODE_ENV, you can set it in the Vite config instead.
10:57:15 AM: vite v4.5.14 building for production...
10:57:15 AM: transforming...
10:57:18 AM: ✓ 47 modules transformed.
10:57:18 AM: ✓ built in 3.39s
10:57:18 AM: [vite:esbuild] Transform failed with 1 error:
10:57:18 AM: /opt/build/repo/react-app/src/pages/GamificationPage.jsx:537:0: ERROR: Unexpected end of file before a closing "p" tag
10:57:18 AM: file: /opt/build/repo/react-app/src/pages/GamificationPage.jsx:537:0
10:57:18 AM: 
10:57:18 AM: Unexpected end of file before a closing "p" tag
10:57:18 AM: 534|                  <div key={index} className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
10:57:18 AM: 535|                    <div className="text-3xl mb-2">🏅</div>
10:57:18 AM: 536|                    <p className="text-white text-sm font-medium">
10:57:18 AM:    |                                                                   ^
10:57:18 AM: 537|
10:57:18 AM:    |  ^
10:57:18 AM: 
10:57:18 AM: error during build:
10:57:18 AM: Error: Transform failed with 1 error:
10:57:18 AM: /opt/build/repo/react-app/src/pages/GamificationPage.jsx:537:0: ERROR: Unexpected end of file before a closing "p" tag
10:57:18 AM:     at failureErrorWithLog (/opt/build/repo/react-app/node_modules/esbuild/lib/main.js:1649:15)
10:57:18 AM:     at /opt/build/repo/react-app/node_modules/esbuild/lib/main.js:847:29
10:57:18 AM:     at responseCallbacks.<computed> (/opt/build/repo/react-app/node_modules/esbuild/lib/main.js:703:9)
10:57:18 AM:     at handleIncomingPacket (/opt/build/repo/react-app/node_modules/esbuild/lib/main.js:762:9)
10:57:18 AM:     at Socket.readFromStdout (/opt/build/repo/react-app/node_modules/esbuild/lib/main.js:679:7)
10:57:18 AM:     at Socket.emit (node:events:518:28)
10:57:18 AM:     at addChunk (node:internal/streams/readable:561:12)
10:57:18 AM:     at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
10:57:18 AM:     at Readable.push (node:internal/streams/readable:392:5)
10:57:18 AM:     at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
10:57:18 AM: ​
10:57:18 AM: "build.command" failed                                        
10:57:18 AM: ────────────────────────────────────────────────────────────────
10:57:18 AM: ​
10:57:18 AM:   Error message
10:57:18 AM:   Command failed with exit code 1: npm install && npm run build (https://ntl.fyi/exit-code-1)
10:57:18 AM: ​
10:57:18 AM:   Error location
10:57:18 AM:   In build.command from netlify.toml:
10:57:18 AM:   npm install && npm run build
10:57:18 AM: ​
10:57:18 AM:   Resolved config
10:57:18 AM:   build:
10:57:18 AM:     base: /opt/build/repo/react-app
10:57:18 AM:     command: npm install && npm run build
10:57:18 AM:     commandOrigin: config
10:57:18 AM:     environment:
10:57:18 AM:       - VITE_FIREBASE_API_KEY
10:57:18 AM:       - VITE_FIREBASE_APP_ID
10:57:18 AM:       - VITE_FIREBASE_AUTH_DOMAIN
10:57:18 AM:       - VITE_FIREBASE_MEASUREMENT_ID
10:57:18 AM:       - VITE_FIREBASE_MESSAGING_SENDER_ID
10:57:18 AM:       - VITE_FIREBASE_PROJECT_ID
10:57:18 AM:       - VITE_FIREBASE_STORAGE_BUCKET
10:57:18 AM:       - NPM_CONFIG_PRODUCTION
10:57:18 AM:       - GENERATE_SOURCEMAP
10:57:18 AM:       - CI
10:57:18 AM:       - SECRETS_SCAN_SMART_DETECTION_ENABLED
10:57:18 AM:     publish: /opt/build/repo/react-app/dist
10:57:18 AM:     publishOrigin: config
10:57:18 AM:   headers:
10:57:19 AM:     - for: /*
      values:
        Access-Control-Allow-Headers: Content-Type, Authorization
        Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
        Access-Control-Allow-Origin: "*"
        Referrer-Policy: strict-origin-when-cross-origin
        Service-Worker-Allowed: /
        X-Content-Type-Options: nosniff
        X-Frame-Options: DENY
        X-XSS-Protection: 1; mode=block
    - for: /assets/*
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /sw.js
      values:
        Cache-Control: no-cache, no-store, must-revalidate
    - for: /manifest.json
      values:
        Cache-Control: public, max-age=86400
  headersOrigin: config
  redirects:
    - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
10:57:19 AM: Build failed due to a user error: Build script returned non-zero exit code: 2
10:57:19 AM: Failing build: Failed to build site
10:57:19 AM: Finished processing build request in 1m18.444s
10:57:19 AM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
