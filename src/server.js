/**
 * Entry point:
 * Starts the communication server using express.js,
 * starts camera stream and docker image and
 * initializes the api endpoints
 */

const express = require("express")
const serialport = require('serialport');
const {SerialPort} = require("serialport");
const bodyParser = require('body-parser')
let fs = require("fs")
let path = require("path");

const serial = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 })
const server = express();
server.use(bodyParser.text())

let rootDirectory = __dirname;
const fileDirectory = '../cocktail_settings';
const drinkSettingsFile = path.join(fileDirectory, "drinks.json");
const cocktailSettingsFile = path.join(fileDirectory, "cocktails.json");

// Arrays to hold drink and cocktail settings
let drinks = [];
let cocktails = [];

/**
 * Writes string to file
 * @param path path to file
 * @param data data as string
 */
let writeToFile = function(path, data) {
    fs.writeFileSync(path, data, function (err){
        if (err) throw err;
    });
}

/**
 * Delay function, used between UART data transmission to give machine time to handle data
 * @param milliseconds
 * @returns {Promise<unknown>}
 */
async function sleep(milliseconds) {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}


/**
 * Save drinks to .json-file on server and sends settings to machine
 */
async function setDrinkSettings() {
    let drinkSettings = JSON.stringify(drinks);
    writeToFile(path.join(fileDirectory, drinkSettingsFile), drinkSettings);

    let drinksForMachine = JSON.parse(drinkSettings);
    for(let i = 0; i<4; i++){
        if(drinksForMachine[i] == null){
            drinksForMachine[i] = {name: "", position: i};
        }
    }

    drinkSettings = JSON.stringify(drinksForMachine);
    serial.write("drinks");
    await sleep(100);
    serial.write(drinkSettings);
    await sleep(500);
}

/**
 * Save cocktails to .json-file on server and sends settings to machine
 */
async function setCocktailSettings() {
    let cocktailSettings = JSON.stringify(cocktails);
    writeToFile(path.join(fileDirectory, cocktailSettingsFile), cocktailSettings);

    // Machine needs array length of the ingredients to initialize cocktails properly
    let cocktailsForMachine = JSON.parse(cocktailSettings)
    cocktailsForMachine.forEach(cocktail => {
        cocktail.ingredient_cout  = cocktail.ingredients.length;
    });

    cocktailSettings = JSON.stringify(cocktailsForMachine);
    serial.write("cocktails");
    await sleep(100);
    serial.write(cocktailSettings);
    await sleep(500);
}

/**
 * Initialize webserver for user frontend
 */
server.use("/style", express.static(__dirname + "/style"));
server.use("/script", express.static(__dirname + "/script"));

server.get("/", (req, res) => {
    res.status(200);
    res.sendFile(__dirname + "/html/index.html");
})

server.post("/saveDrinks", async (req, res) => {
    drinks = JSON.parse(req.body)
    await setDrinkSettings()
    res.status(200);
    res.send("okay");
})
server.post("/saveCocktails", async (req, res) => {
    cocktails = JSON.parse(req.body)
    await setCocktailSettings()
    res.status(200);
    res.send("okay");
})

server.post("/getDrinkSettings", (req, res) => {
    res.status(200);
    res.send(JSON.stringify(drinks));
})

server.post("/getCocktailSettings", (req, res) => {
    res.status(200);
    res.send(JSON.stringify(cocktails));
})

server.post("/mixCocktail", async (req, res) => {
    let cocktail = cocktails[Number(req.body.split(":")[0])];
    let totalAmount = 0;
    cocktail.ingredients.forEach(ingredient => {
        totalAmount += ingredient.amount;
    })
    if(totalAmount > 100){
        res.status(200);
        res.send("invalidAmount")
        return;
    }
    else {
        serial.write("mix");
        await sleep(100);
        serial.write(req.body);
        await sleep(100);
    }
    res.status(200);
    res.send("okay");
})

if (!fs.existsSync(fileDirectory)) {
    fs.mkdirSync(fileDirectory);
}
if(!fs.existsSync(drinkSettingsFile)){
    //drinks = JSON.parse("[{\"name\":\"\",\"position\":0},{\"name\":\"\",\"position\":1},{\"name\":\"\",\"position\":2},{\"name\":\"\",\"position\":3}]");
    drinks = [null, null, null, null];
} else {
    drinks = JSON.parse(fs.readFileSync(drinkSettingsFile, "utf-8"));
}

if(!fs.existsSync(cocktailSettingsFile)){
    cocktails = [];
} else {
    cocktails = JSON.parse(fs.readFileSync(cocktailSettingsFile, "utf-8"));
}

async function setSettings(){
    await setDrinkSettings();
    await setCocktailSettings();
}

setSettings();

server.listen(8080,"192.168.178.122");
console.log(`Listening on http://192.168.178.122:8080`);





