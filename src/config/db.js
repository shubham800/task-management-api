import mongoose from "mongoose";

import debugLib from "debug";
const debug = debugLib("app:server");

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        debug(`Database connected successfully: ${conn.connection.host}`)
    }
    catch(err){
        debug("Database connection failed:", err.message);
        process.exit(1);
    }
}

export default connectDB;