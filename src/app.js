import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";


import authRoutes from "./routes/auth.routes.js";
// import orgRoutes from "./routes/org.routes.js";
// import projectRoutes from "./routes/project.routes.js";
// import taskRoutes from "./routes/task.routes.js";

const app = express();

// Security middleware

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Body parsers
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/org", orgRoutes);
// app.use("/api/project", projectRoutes);
// app.use("/api/task", taskRoutes);

// Global error handler
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(status).json({success:false, message, error:err.errors || err.message || []});
});

export default app;