import express from "express";
import { connectDb } from "./src/core/connection.js";
import router from "./src/router/router.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);

connectDb();
app.listen(4300, () => {
  console.log("Server is running on port 4300");
});
 
 
