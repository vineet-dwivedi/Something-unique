import express from 'express';
import agentRouter from './routes/agent.routes.js';
import morgan from 'morgan';

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware
app.use(morgan('dev'));
app.use(express.json());

app.get("/api/ai/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
})

// Routes
app.use("/api/ai", agentRouter);

export default app;