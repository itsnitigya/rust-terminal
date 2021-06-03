// SocketService.js

// Manage Socket.IO server
const socketIO = require("socket.io");
const Container = require("./Container");
const {stdout, stderr} = require('./Stream');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

class SocketService {
    
    constructor() {
        this.socket = null;
    }

    attachServer(server) {
        if (!server) {
            throw new Error("Server not found...");
        }

        const io = socketIO(server);
        console.log("Created socket server. Waiting for client connection.");
        // "connection" event happens when any client connects to this io instance.

        io.on("connection", (socket) => {
            console.log("Client connect to socket.", socket.id);

            this.socket = socket;
         //   mainSocket = socket;

            // Just logging when socket disconnects.
            this.socket.on("disconnect", () => {
                console.log("Disconnected Socket: ", socket.id);
            });

            // Create a new container service when client connects.

            // Attach any event listeners which runs if any event is triggered from socket.io client
            // For now, we are only adding "input" event, where client sends the strings you type on terminal UI.
            console.log("socket is listening")
            this.socket.on("input", (input) => {

                console.log("from front end command", input);

                // run commmand here 
                // validate input 
                // hard coded container id for now 
                Container.runCommand("d58b70b0892f6ad405bf0221b911ec65edc98719595a84eb6a702bf189aca542", input)

                // wait for container run command
                stdout.on('data', chunk => {
                    let lines = decoder.write(chunk);
                
                    this.socket.emit("output", lines.replace(/\n/g, " "));
                });


                stderr.on('data', chunk => {
                    let lines = decoder.write(chunk);
                
                    this.socket.emit("output", lines.replace(/\n/g, " "));
                });
                
            });
        });
    }
}

module.exports = SocketService;