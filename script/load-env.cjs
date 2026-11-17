const fs = require("node:fs");
const path = require("node:path");

module.exports = function loadEnvFile(
  filePath = path.resolve(__dirname, "../.env"),
) {
  const googleMapsKey = "VITE_GOOGLE_MAPS_API_KEY";
  let googleMapsKeySource =
    process.env[googleMapsKey] !== undefined ? "process environment" : "not configured";
  if (!fs.existsSync(filePath)) {
    process.env.VITE_GOOGLE_MAPS_KEY_SOURCE = googleMapsKeySource;
    return { googleMapsKeySource };
  }

  const contents = fs.readFileSync(filePath, "utf8");
  let envFileHasGoogleMapsKey = false;

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!match || match[1].startsWith("#")) {
      continue;
    }
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
      if (match[2].startsWith('"')) {
        value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
      }
    } else {
      value = value.replace(/\s+#.*$/, "").trimEnd();
    }

    if (match[1] === googleMapsKey) {
      if (value.trim()) {
        envFileHasGoogleMapsKey = true;
      }
      if (value.trim() && process.env[googleMapsKey] !== undefined) {
        if (process.env[googleMapsKey] !== value) {
          // The VPS deployment keeps this public frontend key in the project
          // .env file. Prefer that explicit value over a stale shell/PM2 copy.
          process.env[googleMapsKey] = value;
          googleMapsKeySource = ".env file (overrode process environment)";
          continue;
        }
        googleMapsKeySource =
          "process environment (matches .env)";
      }
    }
    if (process.env[match[1]] !== undefined) {
      continue;
    }

    process.env[match[1]] = value;
    if (match[1] === googleMapsKey) googleMapsKeySource = ".env file";
  }
  if (
    process.env[googleMapsKey] !== undefined &&
    !envFileHasGoogleMapsKey &&
    googleMapsKeySource === "process environment"
  ) {
    googleMapsKeySource = "process environment (no .env value)";
  }
  process.env.VITE_GOOGLE_MAPS_KEY_SOURCE = googleMapsKeySource;
  return { googleMapsKeySource };
};
