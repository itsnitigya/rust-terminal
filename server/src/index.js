// index.js

const http =  require("http");
const Container = require("../src/container");
const SocketService = require("./services/socket");

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
