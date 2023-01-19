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

const drinks = [
    {name: "Vodka", position:1},
    {name: "Gin", position:2},
    {name: "Tonic Water", position:3},
    {name: "Energie", position:4},
]

const ingredients = [
    {name: "Vodka", amount:40},
    {name: "Gin", amount:40},
    {name: "Tonic Water", amount:160},
    {name: "Energie-Drink", amount:160},
]

const cocktails = [
    {name:"Vodka-Energie", ingredients: [getIngredient("Vodka"), getIngredient("Energie-Drink")]},
    {name:"Gin-Tonic", ingredients: [getIngredient("Gin"), getIngredient("Tonic Water")]},
    {name:"Vodka Lemon", ingredients: [getIngredient("Vodka"), getIngredient("Tonic Water")]},
]


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



let drinks_r = JSON.parse(fs.readFileSync(drinkFile, "utf-8"));
let ingredients_r = JSON.parse(fs.readFileSync(ingredientFile, "utf-8"));
let cocktails_r = JSON.parse(fs.readFileSync(cocktailFile, "utf-8"));

console.log(drinks);
console.log(ingredients);
console.log(cocktails);

console.log(drinks_r);
console.log(ingredients_r);
console.log(cocktails_r);

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
