const Docker = require('dockerode');
const MasterStream = require('stream');
const StringDecoder = require('string_decoder').StringDecoder;

let exp = {};

// Stream stuff
let stdout = new MasterStream.PassThrough();
let stderr = new MasterStream.PassThrough();
const decoder = new StringDecoder('utf8');
stdout.on('data', chunk => {
    let lines = decoder.write(chunk);

    console.log(lines);
});

// Put the socket path in env 
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// // run a terminal with tty enabled
function runTerminal(container) {
    const options = {
        Cmd: ["bash", "-c", "ls; date"],
        // Env: ['VAR=testing .env'],
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true
    };

    container.exec(options, function(err, exec) {
        if (err) { console.log(err); return; }

        exec.start(function(err, stream) {
            if (err) return;

            // stdout = new MasterStream.PassThrough();
            // stderr = new MasterStream.PassThrough();
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

exp.startNewRustContainer = () => {
    docker.createContainer({
            Image: 'rust',
            Tty: true,
            //Cmd: ['/bin/bash']
        },
        function(err, container) {
            if (err) {
                console.log(err);
                return;
            }

            container.start({}, function(err, data) {
                runTerminal(container, "");
            });
        });
}

exp.runRustContainer = async (id) => {
    const container = docker.getContainer(id);
    const options = {
        Cmd: ["bash" , "-c",  "rustc hello.rs; ./hello",],
        AttachStdout: true,
        AttachStdin: false,
        Privileged: true,
        Tty: true,
        AttachStderr: true
    };

    container.exec(options, function(err, exec) {
        if (err) { console.log(err); return; }

        exec.start(function(err, stream) {
            if (err) return;

            container.modem.demuxStream(stream, stdout, stderr);

            exec.inspect(function(err, data) {
                if (err) return;
                console.log(data);
            });
        });
    });
}


// start a new ubuntu container
exp.startNewContainer = () => {
    docker.createContainer({
        Image: 'ubuntu:16.04',
        Tty: true,
        Cmd: ['/bin/bash']
    }, function(err, container) {
        if (err) console.log(err);
        // store container.id in redis cache 

        container.start({}, function(err, data) {
            runTerminal(container, "");
        });
    });
}

// run command on a container id
exp.runCommand = (id, cmd) => {

    const container = docker.getContainer(id);

    const options = {
        // do setup for rust ternminal
        // Cmd: ["bash", "-c", 'apt-get update; apt-get install -y \ build-essential \ apt-get update; curl https://sh.rustup.rs -sSf | bash -s -- -y; echo \'source $HOME/.cargo/env\' >> $HOME/.bashrc'],
        Cmd: ["bash", "-c", cmd],
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
            // stdout and stderr are custom streams
            container.modem.demuxStream(stream, stdout, stderr);

            exec.inspect(function(err, data) {
                if (err) return;
                console.log(data);
            });
        });
    });
}

module.exports = exp;

