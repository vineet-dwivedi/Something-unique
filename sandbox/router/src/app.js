import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("combined"));

app.get("/api/router/health", (req, res) => {
    res.status(200).json({ message: "Router server is healthy!" });
});

app.get("/api/router/ready", (req, res) => {
    res.status(200).json({ message: "Router server is ready!" });
});

app.use((req,res,next)=>{
    const headers = req.headers.host;
    const sandboxId = headers.split(".")[0];
    const target = `http://sandbox-service-${sandboxId}`;

    return createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true,
    })(req,res,next);
})

export default app;