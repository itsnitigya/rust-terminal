// index.js

const http =  require("http");
const Container = require("./Container");
const SocketService = require("./SocketService");

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

// Container.startNewRustContainer();
//Container.runRustContainer("d58b70b0892f6ad405bf0221b911ec65edc98719595a84eb6a702bf189aca542");
//Container.startNewContainer();