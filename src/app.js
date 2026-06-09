import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./v1/routes/authRoutes.js";
import caseRoutes from "./v1/routes/caseRoutes.js";

const PORT = 3868;

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors({
    origin: "*"
}));

// setup Routes 

//localhost:3868/api/v1/auth
app.use('/api/v1/auth', authRoutes);

//localhost:3868/api/v1/case
app.use('/api/v1/case', caseRoutes);

app.listen(PORT, () => {
    console.log(`This HTTP app is running on port: ${PORT}`);
});