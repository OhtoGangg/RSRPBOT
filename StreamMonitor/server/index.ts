// server/index.ts
import express from "express";
import { storage } from "./storage.js";
import { router } from "./routes.js";

const app = express();
app.use(express.json());

app.use("/api", router);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
