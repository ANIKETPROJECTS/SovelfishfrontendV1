const fs = require("node:fs");
const path = require("node:path");

module.exports = function loadEnvFile(
  filePath = path.resolve(__dirname, "../.env"),
) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!match || match[1].startsWith("#") || process.env[match[1]] !== undefined) {
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

    process.env[match[1]] = value;
  }
};
