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

// ── Login method ──────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if(!user) throw new ApiError(409, "Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if(!isMatch) throw new ApiError(409, "Invalid email or password");

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {...cookieOptions, maxAge: 15*60*1000});
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, user, "Login successful")
    );
});

// ── Logout method ──────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {refreshToken: null});
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json(
        new ApiResponse(200, null, "Logged out")
    );
});