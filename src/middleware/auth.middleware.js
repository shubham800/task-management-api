import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const protect = async (req, res, next) => {
    try{
        const token = req.cookies?.accessToken;

        if(!token && req.headers.authorization?.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token) throw new ApiError(401, "Not authorized - please login");

        let decoded;

        try{
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        }
        catch (err) {
            throw new ApiError(401, "Invalid or expired token");
        }
        
        const user = await User.findById(decoded.id);
        if(!user || !user.isActive) throw new ApiError(401, "User not found");

        req.user = user;
        next();
    }
    catch(err){
        next(err);
    }
}

export default protect;