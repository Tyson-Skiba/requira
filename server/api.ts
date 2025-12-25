import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import bookRoutes from "./routes/book";
import songRoutes from "./routes/songs";
import requestRoutes from "./routes/requests";
import metadataRoutes from "./routes/metadata";
import { errorHandler } from "./middleware/error-handler";
import { createAdminAccount } from "./services/database";
import { QueueProvider } from "./services/queue-service";

import "./types/global";
import path from "path";

createAdminAccount();

new QueueProvider().poll();

const app = express();

const allowedOrigins = ["http://localhost:5173"];

if (process.env.REQUIRA_HOST) allowedOrigins.push(process.env.REQUIRA_HOST);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/metadata", metadataRoutes);

if (process.env.NODE_ENV === "production") {
  const root = path.join(__dirname, "..", "public");

  app.use(express.static(root));

  // Use a regex that matches everything but doesn't break path-to-regexp
  app.get(/^\/(?!api).*/, (_, res) => {
    res.sendFile(path.join(root, "index.html"));
  });
}

app.use(errorHandler);

app.listen(3022, () => {
  console.log(`Server running on port 3022`);
});
