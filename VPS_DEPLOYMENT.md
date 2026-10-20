# VPS deployment

Use Node.js 20.19 or newer. This app listens on port `3023` by default.

## Configure the server

Create a server-local `.env` file before starting PM2:

```sh
cp .env.example .env
nano .env
```

Set real values for `MONGODB_URI` and `SESSION_SECRET`. Add the payment and
notification credentials if those features are enabled. Set the public
`VITE_RAZORPAY_KEY_ID` and `VITE_GOOGLE_MAPS_API_KEY` values before building
the client. Keep `.env` on the server only; it is excluded from Git.

Then run:

```sh
npm install
npm run build
npx pm2 start ecosystem.config.cjs
```

If PM2 is already installed globally, `pm2 start ecosystem.config.cjs` works
instead. Check the app with `pm2 status` and `pm2 logs sohailfishwebsite`.
The port can be changed by setting `PORT` in `.env`.

## If `npm install` appears stuck

The project has no install-time build or postinstall script. A long pause is
usually npm waiting on the VPS's registry/network connection. Stop the current
command with Ctrl+C, then check:

```sh
npm config get registry
npm ping --fetch-timeout=20000
npm install --verbose --no-audit --no-fund --fetch-retries=0 --fetch-timeout=60000
```

If `npm ping` times out, check DNS, outbound HTTPS access to the configured
registry, and any VPS firewall or proxy. The npm settings in this project
disable the separate audit/funding lookups and bound registry retries/timeouts;
they cannot repair a blocked or unavailable registry connection.
