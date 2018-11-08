const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server); 
var _ = require('lodash');
var moment = require('moment');

let clients = [];

// NEW CONNECTION
io.on("connection", socket => {

    // EMIT TIMESTAMP EVERY SECOND
    setInterval( () => {
        const stringDate = moment().format('MMMM Do YYYY, h:mm:ss a')
        io.emit("date",  stringDate)
    }, 1000)

    // EMIT CONNECTION ID TO CURRENT CLIENT
    socket.emit("connectionId", socket.id)

    // ADD CLIENT NAME TO ARRAY
    socket.on('nClient', data => {

        // EMIT NEW CONNECTION TO ALL CLIENTS
        io.emit("newConnection", { name: data, id: socket.id })

        const client = { name: data, id: socket.id }
        clients.push( client )
        io.emit("connections", clients)
        console.log(clients);

    })

    // ON DISCONNECT, REMOVE CLIENT FROM ARRAY AND EMIT TO AL CLIENTS
    socket.on("disconnect", 
        () => {
            const finded = clients.filter(x => x.id === socket.id)
            console.log("Client disconnected", finded )
            _.remove(clients, {
                id: socket.id
            });
            io.emit("connections", clients)
            io.emit("removeConnection", finded)
            console.log("Connections after remove", clients )
        }
    )
});

server.listen(port, () => console.log(`Listening on port ${port}`));