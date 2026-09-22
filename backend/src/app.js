import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://192.168.18.119:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true,
  })
);

app.use(express.static("public"));
app.use(cookieParser());

import superAdminRouter from "./routes/superAdmin.routes.js";
app.use("/api/users", superAdminRouter);

import userRouter from "./routes/user.route.js";
app.use("/api/users", userRouter);

import universityRouter from "./routes/university.routes.js";
app.use("/api/users", universityRouter);

import canteenRouter from "./routes/canteen.routes.js";
app.use("/api/users", canteenRouter);

import notificationRouter from "./routes/notification.routes.js";
app.use("/api/users", notificationRouter);

export { app };
