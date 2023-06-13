import express from "express";
import cors from "cors";
import httpContext from "express-http-context";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
const __dirname = path.resolve();
import indexRouter from "./routes/index.js";

var app = express();

// app.use(some3rdParty.middleware);
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(httpContext.middleware);

app.use("/", indexRouter);

export default app;
