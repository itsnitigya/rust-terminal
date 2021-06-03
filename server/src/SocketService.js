// SocketService.js

// Manage Socket.IO server
const socketIO = require("socket.io");
const Container = require("./Container");
const {stdout, stderr} = require('./Stream');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');


// only one class instance only one user can issue commands for now
// for scaling using socket-cluster
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
  
        io.on("connection", (socket) => {
            // Create a container service here and store the ip of the device
            // Map the container id and ip so we can send commands to specific container
            console.log("Client connect to socket.", socket.id);

            this.socket = socket;

            this.socket.on("disconnect", () => {
                console.log("Disconnected Socket: ", socket.id);
            });

            console.log("socket is listening")
            this.socket.on("input", (input) => {

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
                
                    this.socket.emit("output-error", lines.replace(/\n/g, " "));
                });
                
            });
        });
    }
}

module.exports = SocketService;