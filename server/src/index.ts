// index.js

import http from "http";
//import SocketService from "./SocketService";
import fs from 'fs';

/* 
  Create Server from http module.
  If you use other packages like express, use something like,
  const app = require("express")();
  const server = require("http").Server(app);
*/
const server = http.createServer((req, res) => {
    res.write("Terminal Server Running.");
    res.end();
});

const port = 8080;

server.listen(port, function() {
    console.log("Server listening on : ", port);
    const socketService = new SocketService();
    socketService.attachServer(server);
});

// Container.loadContainer();