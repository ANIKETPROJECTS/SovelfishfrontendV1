const loadEnvFile = require("./script/load-env.cjs");

loadEnvFile();

const requiredVariables = ["MONGODB_URI", "SESSION_SECRET"];
const missingVariables = requiredVariables.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}. ` +
      "Create a server-local .env file from .env.example before starting PM2.",
  );
}

const environment = {
  NODE_ENV: "production",
  PORT: process.env.PORT || "3023",
  MONGODB_URI: process.env.MONGODB_URI,
  SESSION_SECRET: process.env.SESSION_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  VITE_RAZORPAY_KEY_ID:
    process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
  VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY,
  ADMARK_API_KEY: process.env.ADMARK_API_KEY,
  ADMARK_PHONE_NUMBER_ID: process.env.ADMARK_PHONE_NUMBER_ID,
};

module.exports = {
  apps: [
    {
      name: "sohailfishwebsite",
      script: "dist/index.cjs",
      interpreter: "node",
      env: Object.fromEntries(
        Object.entries(environment).filter(([, value]) => value !== undefined),
      ),
    },
  ],
};
