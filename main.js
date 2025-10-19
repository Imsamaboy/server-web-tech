import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { Server } from "http";

const app = express();
const PORT = process.env.PORT || 3000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers",
};

const s = new Server((req, res) => {
  if (req.url === "/result4/") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      let parsedBody = body;

      res.writeHead(200, "", { ...CORS });

      res.write(
        JSON.stringify({
          message: "99803203-b584-4d0c-a62e-0e9704ea6563",
          "x-result": req.headers["x-test"],
          "x-body": String(parsedBody),
        }),
      );

      res.end();
    });

    return;
  }

  res.end();
});

s.listen(PORT);
