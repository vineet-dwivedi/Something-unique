import { verifyToken } from "../models/utils.js";

export function authMiddleware(req,res,next){
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1] ;

    if (!token){
        return res.status(401).json({message:" unauthorized"})
    }

    const decoded = verifyToken(token)
    if(!decoded){
        return res.status(403).json({message:"Forbidden "})
    }

    req.user = decoded
    next()
}