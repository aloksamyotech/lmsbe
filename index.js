import express from "express";
import { connectDb } from "./src/core/connection.js";
import router from "./src/router/router.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { configDotenv } from "dotenv";
import fs from "fs";

configDotenv();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");

const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); 
  }
};

ensureUploadDir();

app.use("/uploads", express.static(uploadDir));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);


app.get("/", (req, res) => {
  res.send("Server is running on /");
});

connectDb();

app.listen(4300, () => {
  console.log("Server is running on port 4300");
});
