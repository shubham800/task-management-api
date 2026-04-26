import mongoose from "mongoose";

// import debugLib from "debug";
// const debug = debugLib("app:server");

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected successfully: ${conn.connection.host}`)
    }
    catch(err){
        console.log("Database connection failed:", err.message);
        process.exit(1);
    }
}

export default connectDB;