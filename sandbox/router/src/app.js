import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'http';
import {refreshTTL} from './config/redis.js';

const app = express();
app.use(morgan('combined'))

app.get('/api/status/healthz', (req,res)=>{
    res.status(200).json({status: 'ok'});
})

app.get('/api/status/readyz', (req,res)=>{
    res.status(200).json({status: 'ready'});
})

const proxies = {}
const agentProxies = {}

function getProxy(sandboxId){

    const target = `http://sandbox-service-${sandboxId}`;

    if(!proxies[sandboxId]){
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            timeout: 600000,
            proxyTimeout: 600000,
            on: {
                error: (err, req, res) => {
                    if (!res.headersSent) {
                        res.status(502);
                        res.setHeader("Content-Type", "application/json");
                    }

                    res.end(JSON.stringify({
                        message: "Sandbox preview backend is unavailable",
                        error: err.message
                    }));
                }
            }
        })
    }
    return proxies[sandboxId]
}

function getAgentProxy(sandboxId){

    const target = `http://sandbox-service-${sandboxId}:3000`;

    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            timeout: 600000,
            proxyTimeout: 600000,
            on: {
                error: (err, req, res) => {
                    if (!res.headersSent) {
                        res.status(502);
                        res.setHeader("Content-Type", "application/json");
                    }

                    res.end(JSON.stringify({
                        message: "Sandbox agent backend is unavailable",
                        error: err.message
                    }));
                }
            }
        })
    }
    return agentProxies[sandboxId]
}

app.use(async(req, res, next) => {
    const host = req.headers.host || '';
    const sandboxId = host.split('.')[0]; // Extract the sandbox ID from the subdomain
    const targetUrl = `http://sandbox-service-${sandboxId}`; // Construct the target URL based on the sandbox ID

    // Refresh the TTL for the sandbox key in Redis
    await refreshTTL(sandboxId);

    if (host.split('.')[1] === 'agent'){
        return getAgentProxy(sandboxId) (req,res,next)
    } else if (host.split('.')[1] === 'preview'){
        return getProxy(sandboxId) (req,res,next);
    }

    return res.status(404).json({
        message: "Unsupported host",
        host
    });
})

const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
    try {
        const host = req.headers.host || '';
        const parts = host.split('.');
        const sandboxId = parts[0];
        const type = parts[1];

        console.log('WS upgrade request for sandbox:', sandboxId, type);

        if (type === 'agent') {
            const proxy = getAgentProxy(sandboxId);
            if (typeof proxy.upgrade === 'function') {
                proxy.upgrade(req, socket, head);
            } else if (typeof proxy === 'function') {
                proxy(req, socket, head);
            }
        } else if (type === 'preview') {
            const proxy = getProxy(sandboxId);
            if (typeof proxy.upgrade === 'function') {
                proxy.upgrade(req, socket, head);
            } else if (typeof proxy === 'function') {
                proxy(req, socket, head);
            }
        } else {
            socket.destroy();
        }
    } catch (err) {
        console.error('Error handling WS upgrade in router:', err);
        try { socket.destroy(); } catch (_) {}
    }
});

export default server;
