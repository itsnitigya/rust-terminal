# Rust Terminal

Hosted on [codedamn.nitigyakapoor.in](https://codedamn.nitigyakapoor.in)

## Technologies to use:

* React/Next.js for a basic frontend (recommended) -> React
* TypeScript for backend (mandatory) -> Done
* WebSockets (mandatory) -> Socket.io
* Docker for containerization (recommended) -> Not done for Node
* Xterm.js for terminal access (recommended) -> Used
* Docker engine API (recommended) -> Used
* Dockerode for interacting with docker engine API (recommended) -> Used

## Functionalities to implement:

* A code editor on frontend -> Basic edtior implemented with 2 buttons, save and run code. Save code will save the code in buffer and run code will send the code to rust container and output will be sent to the same screen. 
* A terminal on frontend -> Implemented using XTerm.js. 
* Terminal on frontend connected to a docker container with rust installed (i.e. `rustc` is available on bash) -> Connected using sockets and streams. 
* Changes made in the code editor on the frontend are available on the backend filesystem (i.e. if you write "hello" on frontend in the editor, it is saved on the container in a file). Play with the codedamn playground example above to get more clarity on what file synchronization means. Note again: you do not need to have a two way file system synchronization at this point. -> A file is saved but the implementation is ugly. ( ideally should have been [contain.putContainer](https://docs.docker.com/engine/api/v1.37/#operation/PutContainerArchive) )
* Creates and removes containers on-demand, i.e. if someone opens the same link in a new tab they get a new container and a new environment -> Containers are created on-demand and removed as soon as socket disconnects. But only one container works at a single time because of single socket connection. ( solution : socket cluster )


<img width="811" alt="Screenshot 2021-06-04 at 4 09 46 AM" src="https://user-images.githubusercontent.com/40539705/120721062-bc91df80-c4ea-11eb-935d-988eda183859.png">


### Future work : 
2. Map the ip/hardware of the device to certain a container id. Disconnect socket if client is inactive and release the container. 
3. Maintain a list of active running container ID's.
4. Have containers running on the server (rustc installed). Persist the activing running containers id in cache. 
5. If we need to have persistance we can either assign a container to some user or take backups to/from some storage service. If we take backups then loading a container will take time. 
6. Need to use socket streams from the client and server end. Share rust code or terminal commands from these streams and run inside the container using exec and creating a duplex stream. Duplex stream between exec and socket stream. DockerNode provides the duplex stream in exec and we can use the package socket-io-stream for creating a stream on the socket connection that we established with the client.
7. Filter rust code or restrict importing certain libraries which give access to os related function for preventing attacks on the container. Might lead to container crashes.
8. We can scale socket connections using socket-cluster. 
