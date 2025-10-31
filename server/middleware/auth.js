import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    if(!token){
        return res.json({success: false, message: "not authorized"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.json({success: false, message: "not authorized"})
        }
        
        req.user = await User.findById(decoded).select("-password")
        
        if(!req.user) {
            return res.json({success: false, message: "User not found"})
        }

        next();
    } catch (error) {
        console.log(error); // Add logging for debugging
        return res.json({success: false, message: "not authorized", error: error.message})
    }
}