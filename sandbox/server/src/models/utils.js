import jwt from "jsonwebtoken";

export function verifyToken(token){
    try{
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err){
        console.error("Invalid JWT token:", err);
        return null;
    }
}