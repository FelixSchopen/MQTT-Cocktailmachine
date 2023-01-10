/**
 * Entry point:
 * Starts the communication server using express.js,
 * starts camera stream and docker image and
 * initializes the api endpoints
 */

const express = require("express")
const mosca = require('mosca')
const mqtt = require("mqtt")

const server = express();

let settings = {port: 1235}
let broker = new mosca.Server(settings)

let client = mqtt.connect("mqtt://localhost:1235")
let topic = "cocktail"
let message = "Hello World!"

broker.on('ready', () => {
    console.log("Broker is ready")
})

client.on("connect", () => {
    console.log("Publisher is ready")
});

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
    client.publish(topic, message)
    console.log("Message sent!")
    res.status(200);
    res.send();
})
