// SocketService.js

// Manage Socket.IO server
const socketIO = require("socket.io");
import Container from "../Container";
import stdout from "../Stream";
import stderr from "../Stream";

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// one class instance therefore only one user can issue commands for now
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

        // const id = await Container.startNewRustContainer();
        // console.log("started new container ", id )

        socket = sck;

        socket.on("disconnect", async () => {
            console.log("disconnected Socket ", socket.id);
            // await Container.killContainer(id);
            // console.log("deleted Container ", id);
        });

        socket.on("input", (input) => {

            // validate input 
          //  Container.runCommand("f5affc6470296035e8c17a89f3883cc92d30e7282b6b6e4162a3951f660a1e77", input)
            Container.runCommand("0706abcd6f613eb9f2f87021435bd68fd929688112e7b7610be2f9c63a83b3ec", input)

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
          //  Container.runCommand("f5affc6470296035e8c17a89f3883cc92d30e7282b6b6e4162a3951f660a1e77", input)
            await Container.runCode("0706abcd6f613eb9f2f87021435bd68fd929688112e7b7610be2f9c63a83b3ec", input)

            // wait for container run command
            stdout.on('data', chunk => {
                let lines = decoder.write(chunk);
                socket.emit("output-code", lines.replace(/\n/g, " "));
            });

            
        });
    });
}

export default  exp;