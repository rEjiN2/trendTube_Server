import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
 import userRoutes from "./routes/user/users.js"
import commentRoutes from "./routes/user/comments.js";
import videoRoutes from "./routes/user/videos.js";
import authRoutes from "./routes/user/auth.js";
import adminAuthRoutes from "./routes/admin/adminAuth.js";
import adminVerifyRoutes from "./routes/admin/adminVerify.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import User from "./models/Users.js"

 

const app = express();
dotenv.config();

const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("Connected to db");
    })
    .catch((err) => {
      console.log("Error");
      throw err;
    });
};
app.use(
  cors({
    origin: ["https://www.trendtube.online","https://www.api.trendtube.online"],
    credentials: true,
    methods: ['GET', 'POST' ,'PUT' ,'DELETE']
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://www.trendtube.online");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://www.trendtube.online");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Content-Type", "application/json;charset=UTF-8");
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

const addAccessTokenToHeader = async (req, res, next) => {
  const accessToken = req.cookies["access_token"];
  if (accessToken) {
    try {
      const decodedToken = jwt.verify(accessToken, process.env.JWT);
      const user = await User.findById(decodedToken.id);
      if (user) {
        req.user = user; 
      }
    } catch (err) {
      console.error(err);
    }
  }
  next();
};




app.use(addAccessTokenToHeader);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/adminAuth", adminAuthRoutes);
app.use("/api/adminVerify", adminVerifyRoutes);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something Went Wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const server = app.listen(5000, () => {
  connect();
  console.log("Connected to Server");
});

