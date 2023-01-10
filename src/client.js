let mqtt = require("mqtt")
let client = mqtt.connect("mqtt://localhost:1235")
var topic = "cocktail"

client.on('message', (topic, message) => {
    message = message.toString()
    console.log(message)
})

client.on("connect", () => {
    console.log("Client is ready")
    client.subscribe(topic)
})