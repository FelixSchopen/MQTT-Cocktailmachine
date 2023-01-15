/**
 * Entry point:
 * Starts the communication server using express.js,
 * starts camera stream and docker image and
 * initializes the api endpoints
 */

const express = require("express")
const serialport = require('serialport');
const {SerialPort} = require("serialport");

const serial = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 })

const server = express();

server.listen(8080,"192.168.178.122");
console.log(`Listening on http://192.168.178.122:8080`);

/**
 * Initialize webserver for user frontend
 */
server.use("/style", express.static(__dirname + "/style"));
server.use("/script", express.static(__dirname + "/script"));

server.get("/", (req, res) => {
    res.status(200);
    res.sendFile(__dirname + "/html/index.html");
})

server.get("/btn1", (req, res) => {
    serial.write('Hallo');
    res.status(200);
    res.send();
})
