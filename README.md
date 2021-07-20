# Rust Terminal

## Local Dev (Install):

``` bash
docker pull rust # need this image for creating containers
git clone https://github.com/itsnitigya/rust-terminal
cd rust-terminal/server/src
npm install 
npx ts-node index.ts # starts server on 8080
```

## Technologies:

* React
* TypeScript
* Socket.io
* Docker for containerization
* Xterm.js for terminal access
* Docker engine API
* Dockerode

## Functionalities implemented:

* A code editor on frontend -> Basic editor implemented with 2 buttons, save and run code. Save code will save the code in buffer and run code will send the code to rust container and output will be sent to the same screen. 
* A terminal on frontend -> Implemented using XTerm.js. 
* Terminal on frontend connected to a docker container with rust installed (i.e. `rustc` is available on bash) -> Connected using sockets and streams. 
* Changes made in the code editor on the frontend are available on the backend filesystem (i.e. if you write "hello" on frontend in the editor, it is saved on the container in a file). Play with the codedamn playground example above to get more clarity on what file synchronization means. Note again: you do not need to have a two way file system synchronization at this point. -> A file is saved but the implementation is ugly. ( ideally should have been [contain.putContainer](https://docs.docker.com/engine/api/v1.37/#operation/PutContainerArchive) )
* Creates and removes containers on-demand, i.e. if someone opens the same link in a new tab they get a new container and a new environment -> Containers are created on-demand and removed as soon as socket disconnects. But only one container works at a single time because of a single socket connection. ( solution : socket cluster )

<img width="811" alt="Screenshot 2021-06-04 at 4 09 46 AM" src="https://user-images.githubusercontent.com/40539705/120721062-bc91df80-c4ea-11eb-935d-988eda183859.png">
