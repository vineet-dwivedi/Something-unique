import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("combined"));

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