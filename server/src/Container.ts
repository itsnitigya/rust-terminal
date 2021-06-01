import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

let exp : any = {};

// Put the socket path in env 
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

exp.createRustContainer = () => {
    // Docker Image should exist on the system else the command will fail. 
    // Install the Image for ubuntu 16.04 using Makefile when setting up the server.
    docker.createContainer({
            Image: 'rust',
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ["date"],
        },
        function(err, container) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(container);
            container.start(function(err, data) {
                if (err) {
                    console.log("error while starting", err);
                } else {
                    console.log(data);
                }
            });
            container.attach({ stream: true, stdout: true, stderr: true }, function(err, stream) {
                stream.pipe(process.stdout);
            });
        });
}

// run a terminal with tty enabled
function runTerminal(container, cmd) {
    const options = {
        // do setup for rust ternminal
        // Cmd: ["bash", "-c", 'apt-get update; apt-get install -y \ build-essential \ apt-get update; curl https://sh.rustup.rs -sSf | bash -s -- -y; echo \'source $HOME/.cargo/env\' >> $HOME/.bashrc'],
        Cmd: ["bash", "-c", "ls; date"],
        Env: ['VAR=testing .env'],
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true
    };

    container.exec(options, function(err, exec) {
        if (err) { console.log(err); return; }

        exec.start(function(err, stream) {
            if (err) return;

            // create a socket stream 
            // need to use the stream object to socket connection
            container.modem.demuxStream(stream, process.stdout, process.stderr);

            exec.inspect(function(err, data) {
                if (err) return;
                console.log(data);
            });
        });
    });
}

exp.loadContainer = (id) => {
    docker.createContainer({
        Image: 'ubuntu:16.04',
        Tty: true,
        Cmd: ['/bin/bash']
    }, function(err, container) {
        if (err) console.log(err);
        container.start({}, function(err, data) {
            runTerminal(container, "");
        });
    });
}

module.exports = exp;