const Docker = require('dockerode');
const to = require('./utils/to')
const {stdout, stderr} = require('./stream');

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

exp.startNewRustContainer = async () => {
    let err;

    let container;
    [err, container] = await to(docker.createContainer({
        Image: 'rust',
        Tty: true,
    }));

    let id = container.id;

    container.start({}, function(err, data) {
        runTerminal(container);
    });

    return id;
}

exp.killContainer = async (id) => {
    const container = docker.getContainer(id);

    await container.stop();
    container.remove();
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

exp.runCode = async (id, code) => {

    const container = docker.getContainer(id);

    let options = {
        Cmd: ["bash", "-c", `rm testing.rs; echo "${code}" >> testing.rs`],
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true
    };

    let err, exec;

    [err, exec] = await to(container.exec(options));

    await exec.start(function(err, stream) {
        if (err) return;

        container.modem.demuxStream(stream, process.stdout, process.stderr);
    });

    options = {
        Cmd: ["bash", "-c", "rustc testing.rs; ./testing"],
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true
    };

    [err, exec] = await to(container.exec(options));
    await exec.start(function(err, stream) {
        if (err) return;

        container.modem.demuxStream(stream, stdout, stderr);
    });
}

module.exports = exp;

