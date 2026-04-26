import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {generateAccessToken, generateRefreshToken, cookieOptions} from "../utils/generateTokens.js";
import crypto from "crypto";

// ── Register method ──────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        throw new ApiError(400, "All fields are required");
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if(exists) throw new ApiError(409, "Email already registered");

    const user = await User.create({name, email, password});

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {...cookieOptions, maxAge: 15*60*1000});
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json(
        new ApiResponse(201, user, "Registration successful")
    );
});