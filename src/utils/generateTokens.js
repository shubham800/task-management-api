import jwt from "jsonwebtoken";


const generateAccessToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge:   7 * 24 * 60 * 60 * 1000   // 7 days
};

export {generateAccessToken, generateRefreshToken, cookieOptions}