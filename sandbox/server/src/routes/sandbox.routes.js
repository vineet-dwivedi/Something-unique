import { Router } from "express";
import { createPods } from "../kubernetes/pod.js"
import { createService } from "../kubernetes/service.js";
import { createSandboxKey } from "../config/redis.js";
import { v7 as uuid } from "uuid";
import {authMiddleware} from "../middlewares/auth.middleware.js"
import Project from "../models/project.model.js";

const router = Router();

router.post('/project', authMiddleware, async (req,res)=>{
    const {title} = req.body;
    const newProject = new Project({
        user: req.user.id,
        title
    });
    await newProject.save();

    return res.status(201).json({
        message: 'Project created successfully',
        project: newProject
    })
})

router.post('/start', authMiddleware, async (req,res)=>{
    const projectId = req.body.projectId;

    const project = await Project.findById(projectId)

    if(!project){
        return res.status(404).json({message: "Project not found"});
    }

    const sandboxId = uuid();
    const baseDomain = process.env.SANDBOX_BASE_DOMAIN || "127.0.0.1.nip.io";
    await Promise.all([
        createPods(sandboxId,projectId),
        createService(sandboxId),
        createSandboxKey(sandboxId)
    ])

    return res.status(200).json({
        message: "Sandbox started successfully!",
        sandboxId,
        previewUrl: `http://${sandboxId}.preview.${baseDomain}`,
        agentUrl: `http://${sandboxId}.agent.${baseDomain}`
    });
});

router.get('/projects', authMiddleware, async (req,res)=>{
    const projects = await Project.find({
        user: req.user.id
    });

    return res.status(200).json({
        message: 'Project retrived successfully',
        projects
    })
})

export default router;