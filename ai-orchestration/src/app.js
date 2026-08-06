import express from 'express';
import agentRouter from './routes/agent.routes.js';
import morgan from 'morgan';

const app = express();

// CORS Middleware — must use a specific origin (not '*') when credentials are included
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
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