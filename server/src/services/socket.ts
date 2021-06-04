// SocketService.js

// Manage Socket.IO server
const socketIO = require("socket.io");
import Container from "../container";
import stdout from "../stream";
import stderr from "../stream";

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// one instance therefore only one user can issue commands for now
// for scaling use socket-cluster
let exp : any = {};
let socket : any;


exp.attachServer = (server) => {
    if (!server) {
        throw new Error("server not found...");
    }
    const io = socketIO(server);

    console.log("created socket server. Waiting for client connection.");

    io.on("connection", async (sck) => {
        console.log("client connect to socket ", sck.id);

        const id = await Container.startNewRustContainer();
        console.log("started new container ", id )

        socket = sck;

        socket.on("disconnect", async () => {
            console.log("disconnected Socket ", socket.id);
            // await Container.killContainer(id);
            // console.log("deleted Container ", id);
        });

        socket.on("input", (input) => {

            // validate input 
            Container.runCommand(id, input)

            // wait for container run command
            stdout.on('data', chunk => {
                let lines = decoder.write(chunk);
                socket.emit("output", lines.replace(/\n/g, " "));
            });


            stderr.on('data', chunk => {
                let lines = decoder.write(chunk);
                socket.emit("output-error", lines.replace(/\n/g, " "));
            });
            
        });

        socket.on("input-code", async (input) => {

            // validate input 
            Container.runCode(id, input)

            // wait for container run command
            stdout.on('data', chunk => {
                let lines = decoder.write(chunk);
                socket.emit("output-code", lines.replace(/\n/g, " "));
            });

            
        });
    });
}

export default  exp;