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
