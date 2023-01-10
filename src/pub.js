let mqtt = require("mqtt")
let client = mqtt.connect("mqtt://localhost:1235")
let topic = "cocktail"
let message = "Hello World!"

client.on("connect", () => {
    console.log("Publisher is ready")
    setInterval(() => {
        client.publish(topic, message)
        console.log("Message sent!")
    }, 5000)
});