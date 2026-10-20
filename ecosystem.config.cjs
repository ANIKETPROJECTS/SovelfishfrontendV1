module.exports = {
  apps: [
    {
      name: "sohailfishwebsite",
      script: "dist/index.cjs",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3023,
        MONGODB_URI: "mongodb+srv://sairajkoyande_db_user:NdEdiAfOxPf43dek@fishfrontend.7sexpjs.mongodb.net",
        SESSION_SECRET: "4ht7xAFRChv4cXoq7wxN95DCONA9VrRalzJjMP7QlxcIp4QjKhHl2aC4snWbF5EwL7EKkOSSmyT7NEEEtsQn7Q==",
        VITE_GOOGLE_MAPS_API_KEY: "",
        ADMARK_API_KEY: "",
        ADMARK_PHONE_NUMBER_ID: "",
        RAZORPAY_KEY_ID: "",
        RAZORPAY_KEY_SECRET: "",
        RAZORPAY_WEBHOOK_SECRET: ""
      }
    }
  ]
};
