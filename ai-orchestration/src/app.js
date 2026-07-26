import express from "express";
import morgan from "express";

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/ai/healthz', (req,res)=>{
    res.status(200).json({status: ok});
})

export default app;