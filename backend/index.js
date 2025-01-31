import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectToDB from "./config/db.js";
import mainRouter from "./routes/index.js";
import jwt from 'jsonwebtoken';
import setupSocket from "./socket/socket.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const corsOptions={
    origin: 'https://chatbot-rentok-rtc.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version']
};
app.use(cors(corsOptions));

app.use(mainRouter);

app.get("/",async(req,res)=>{
    res.send("Hello");
})
const server=http.createServer(app);

const io=new Server(server,{
    cors:corsOptions,
    transports:['websocket','polling']
});

setupSocket(io);


connectToDB()
    .then(() => {
        server.listen(port, () => {
            console.log(`Listening on PORT ${port}`);
        });
    }).catch((error) => {
        console.error('Error connecting to database:', error);
        process.exit(1);
    });

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
