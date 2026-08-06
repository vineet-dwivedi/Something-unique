import dns from 'node:dns';
// Force Node.js to use Google and Cloudflare DNS servers
dns.setServers(['8.8.8.8', '1.1.1.1']);
import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

connectDB();
const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
