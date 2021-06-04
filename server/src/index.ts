// index.js

import http = require('http');
import SocketService from "./services/socket";

const server = http.createServer((req, res) => {
    res.write("Terminal Server Running.");
    res.end();
});

const port = 8080;

server.listen(port, function() {
    console.log("Server listening on : ", port);
    // const socketService : any = new SocketService();
    SocketService.attachServer(server);
});
