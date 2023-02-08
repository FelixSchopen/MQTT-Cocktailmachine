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


const serial = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 })

const server = express();
server.use(bodyParser.text())

let fs = require("fs")
let path = require("path");

let rootDirectory = __dirname;
const fileDirectory = '../cocktail_settings';

const drinkFile = path.join(fileDirectory, "drinks.json");
const ingredientFile = path.join(fileDirectory, "ingredients.json");
const cocktailFile = path.join(fileDirectory, "cocktails.json");

if (!fs.existsSync(fileDirectory)) {
    fs.mkdirSync(fileDirectory);
}

function getIngredient(name) {
    let return_val = {};
    ingredients.forEach( ingredient => {
        if(ingredient.name === name){
            return_val = ingredient;
            return;
        }
    });
    return return_val;
}

let drinks = [
    {name: "Vodka", position:0},
    {name: "Gin", position:1},
    {name: "Tonic Water", position:2},
    {name: "Energie", position:3},
]

let ingredients = [
    {drink: drinks[0], amount:40},
    {drink: drinks[1], amount:40},
    {drink: drinks[2], amount:160},
    {drink: drinks[3], amount:160},
]

let cocktails = [
    {name:"Vodka-Energie", ingredients: [ingredients[0], ingredients[3]]},
    {name:"Gin-Tonic", ingredients: [ingredients[1], ingredients[2]]},
    {name:"Vodka Lemon", ingredients: [ingredients[0], ingredients[2]]},
]

cocktails.forEach(cocktail =>{
    cocktail.ingredient_cout  = cocktail.ingredients.length;
});


fs.writeFileSync(path.join(fileDirectory, drinkFile), JSON.stringify(drinks), function (err){
    if (err) throw err;
    console.log('Drinks saved!');
});

fs.writeFileSync(path.join(fileDirectory, ingredientFile), JSON.stringify(ingredients), function (err){
    if (err) throw err;
    console.log('Ingredients saved!');
});

fs.writeFileSync(path.join(fileDirectory, cocktailFile), JSON.stringify(cocktails), function (err){
    if (err) throw err;
    console.log('Cocktails saved!');
});



let drinks_json = fs.readFileSync(drinkFile, "utf-8");
let ingredients_json = fs.readFileSync(ingredientFile, "utf-8");
let cocktails_json = fs.readFileSync(cocktailFile, "utf-8");

let drinks_r = JSON.parse(drinks_json);
let ingredients_r = JSON.parse(ingredients_json);
let cocktails_r = JSON.parse(cocktails_json);


console.log(drinks);
console.log(ingredients);
console.log(cocktails);

console.log(drinks_r);
console.log(ingredients_r);
console.log(cocktails_r);

/**
 * Delay function, used between data transmission
 * to give MCU time to handle data
 * @param milliseconds
 * @returns {Promise<unknown>}
 */
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Send cocktail configurations to MCU
 * @returns {Promise<void>}
 */
async function init(){
    serial.write("drinks");
    await sleep(100);
    serial.write(drinks_json);
    await sleep(500);

    serial.write("ingredients");
    await sleep(100);
    serial.write(ingredients_json);
    await sleep(500);

    serial.write("cocktails");
    await sleep(100);
    serial.write(cocktails_json);
}

init();


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

server.post("/saveDrinks", (req, res) => {
    console.log(req.body)
    for(let i = 0; i<299999; i++){
        console.log()
    }
    console.log(req.body)
    if(drinks_json === req.body){
        console.log("success")
    }
    res.status(200);
    res.send("received data");
})
server.post("/saveCocktails", (req, res) => {
    console.log("received request")
    for(let i = 0; i<299999; i++){
        console.log()
    }
    console.log(req.body)
    if(cocktails_json === req.body){
        console.log("success")
    }
    res.status(200);
    res.send("received data");
})


