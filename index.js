import express from "express";
import { connectDb } from "./src/core/connection.js";
import router from "./src/router/router.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
 
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);

app.get("/", (req, res) => {
  res.send("server is running on /");
});

connectDb();
app.listen(4300, () => {
  console.log("Server is running on port 4300");
});
