const Docker = require('dockerode');
const to = require('./utils/to')
const {stdout, stderr} = require('./Stream');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

let exp = {};

// run a terminal with tty enabled
// this step keeps the container alive to issue commands
function runTerminal(container) {
    const options = {
        Cmd: ["bash", "-c", "date"],
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true
    };

    container.exec(options, function(err, exec) {
        if (err) { console.log(err); return; }

        exec.start(function(err, stream) {
            if (err) return;

            container.modem.demuxStream(stream, process.stdout, process.stderr);

            exec.inspect(function(err, data) {
                if (err) return;
                // console.log(data);
            });
        });
    });
}

exp.startNewRustContainer = () => {
    docker.createContainer({
            Image: 'rust',
            Tty: true,
        },
        function(err, container) {
            if (err) {
                console.log(err);
                return;
            }

            // store container.id in redis cache 
            container.start({}, function(err, data) {
                runTerminal(container, "");
            });
        });
}

// cleaned the callbacks using promises (time crunch so did just one for function)
exp.runRustContainer = async (id) => {
    let err;

    const container = await docker.getContainer(id);
    const options = {
        Cmd: ["bash" , "-c",  "rustc testing.rs; ./testing"],
        AttachStdout: true,
        AttachStdin: false,
        Privileged: true,
        Tty: true,
        AttachStderr: true
    };

    let exec;
    [err, exec] = await to(container.exec(options));
    if (err) { console.log(err); return; }

    let stream;
    [err, stream] = await to(exec.start());
    if (err) return;

    // stream goodness
    container.modem.demuxStream(stream, stdout, stderr);

    let data;
    [err, data] = await to (exec.inspect());
    if (err) return;
    console.log(data);
}

// run command on a container id
exp.runCommand = (id, cmd) => {

    const container = docker.getContainer(id);

    const options = {
        Cmd: ["bash", "-c", cmd],
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true
    };

    container.exec(options, function(err, exec) {
        if (err) { console.log(err); return; }

        exec.start(function(err, stream) {
            if (err) return;

            container.modem.demuxStream(stream, stdout, stderr);

            exec.inspect(function(err, data) {
                if (err) return;
                //console.log(data);
            });
        });
    });
}

// not really required hopefully 
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


module.exports = exp;

