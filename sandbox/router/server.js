import server from "./src/app.js";

const PORT = 3000;
const listener = server.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    listener.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception in router server:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection in router server:", reason);
});
