# rust-terminal

<img width="830" alt="Screenshot 2021-06-01 at 11 54 44 PM" src="https://user-images.githubusercontent.com/40539705/120372393-c671e200-c334-11eb-85e8-9bafb1f04bdb.png">

1. Pull the ubuntu image on the server. 
2. Map the ip/hardware of the device to certain a container id. Disconnect socket if client is inactive and release the container. 
3. Maintain a list of active running container ID's.
4. Have containers running on the server (rustc installed). Persist the activing running containers id in cache. 
5. If we need to have persistance we can either assign a container to some user or take backups to/from some storage service. If we take backups then loading a container will take time. 
6. Need to use socket streams from the client and server end. Share rust code or terminal commands from these streams and run inside the container using exec and creating a duplex stream. Duplex stream between exec and socket stream.
7. Filter rust code or restrict importing certain libraries which give access to os related function for preventing attacks on the container. Might lead to container crashes.
8. We can scale socket connections using socket-cluster. 
