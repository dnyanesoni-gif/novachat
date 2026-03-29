20:02:49.559 Running build in Washington, D.C., USA (East) – iad1
20:02:49.560 Build machine configuration: 2 cores, 8 GB
20:02:49.693 Cloning github.com/dnyanesoni-gif/novachat (Branch: main, Commit: eabbe4a)
20:02:49.955 Cloning completed: 262.000ms
20:02:50.658 Restored build cache from previous deployment (6PmCpZMXESntdvQU4p9D3rUyX5UD)
20:02:50.955 Running "vercel build"
20:02:51.576 Vercel CLI 50.37.1
20:02:51.789 Installing dependencies...
20:02:56.023 
20:02:56.024 up to date in 4s
20:02:56.024 
20:02:56.024 22 packages are looking for funding
20:02:56.024   run `npm fund` for details
20:02:56.057 Detected Next.js version: 16.2.0
20:02:56.062 Running "npm run build"
20:02:56.166 
20:02:56.167 > my-project@0.1.0 build
20:02:56.167 > next build
20:02:56.167 
20:02:56.830 ▲ Next.js 16.2.0 (Turbopack)
20:02:56.831 
20:02:56.859   Creating an optimized production build ...
20:03:02.494 
20:03:02.495 > Build error occurred
20:03:02.497 Error: Turbopack build failed with 1 errors:
20:03:02.498 ./app/chat/page.tsx:41:9
20:03:02.498 Expected ';', '}' or <eof>
20:03:02.499   [90m39 |[0m   }, []);
20:03:02.499   [90m40 |[0m
20:03:02.499 [31m[1m>[0m [90m41 |[0m [33mFinding[0m [33mSomeone[0m...
20:03:02.500   [90m   |[0m         [31m[1m^^^^^^^[0m
20:03:02.500   [90m42 |[0m [33mConnecting[0m you [36mwith[0m a stranger. [33mPlease[0m wait...
20:03:02.500   [90m43 |[0m
20:03:02.501   [90m44 |[0m   [36mconst[0m nextChat = useCallback(() => {
20:03:02.501 
20:03:02.501 Parsing ecmascript source code failed
20:03:02.501 
20:03:02.502 
20:03:02.502     at <unknown> (./app/chat/page.tsx:41:9)
20:03:02.541 Error: Command "npm run build" exited with 1
