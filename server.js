import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import debugLib from "debug";

const debug = debugLib("app:server");

const PORT = process.env.PORT || 5000;


connectDB()
    .then(() => {
        app.listen(PORT, () => {
            debug(`Server running on port ${PORT}`);
        });
    });