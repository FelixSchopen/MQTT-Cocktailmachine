let cocktails = []
let drinks = []

let cocktails_save = []
let drinks_save = []

let defaultCocktailSettingsString = "[{\"name\":\"Vodka-Energie\",\"ingredients\":[{\"drink\":{\"name\":\"Vodka\",\"position\":0},\"amount\":40},{\"drink\":{\"name\":\"Energie\",\"position\":3},\"amount\":160}],\"ingredient_cout\":2},{\"name\":\"Gin-Tonic\",\"ingredients\":[{\"drink\":{\"name\":\"Gin\",\"position\":1},\"amount\":40},{\"drink\":{\"name\":\"Tonic Water\",\"position\":2},\"amount\":160}],\"ingredient_cout\":2},{\"name\":\"Vodka Lemon\",\"ingredients\":[{\"drink\":{\"name\":\"Vodka\",\"position\":0},\"amount\":40},{\"drink\":{\"name\":\"Tonic Water\",\"position\":2},\"amount\":160}],\"ingredient_cout\":2}]"
let defaultDrinkSettingsString = "[{\"name\":\"Vodka\",\"position\":0},{\"name\":\"Gin\",\"position\":1},{\"name\":\"Tonic Water\",\"position\":2},{\"name\":\"Energie\",\"position\":3}]";

let cocktailSettingsIndex = 0;

window.fn = {};

window.fn.toggleMenu = function () {
    document.getElementById('appSplitter').right.toggle();
};

window.fn.loadView = function (index) {
    document.getElementById('appTabbar').setActiveTab(index);
    document.getElementById('sidemenu').close();
};

window.fn.loadLink = function (url) {
    window.open(url, '_blank');
};

window.fn.pushPage = function (page, anim) {
    if (anim) {
        document.getElementById('appNavigator').pushPage(page.id, { data: { title: page.title }, animation: anim });
    } else {
        document.getElementById('appNavigator').pushPage(page.id, { data: { title: page.title } });
    }
};

/**
 * Confirm cocktail to mix and ente5 size of the cocktail
 */
let confirmCocktail = function(idx) {

    let cocktail = cocktails[idx];
    let totalAmount = 0;
    cocktail.ingredients.forEach(ingredient => {
        totalAmount += ingredient.amount;
    })
    if(totalAmount > 100){
        ons.notification.alert("Invalid cocktail settings. Ingredients exceed 100%")
        return;
    }

    ons.notification.prompt({
        message: "Click anywhere to cancel",
        cancelable: true,
        defaultValue: 200,
        title: "Enter cocktail size in ml"
        //primaryButtonIndex: 2,
        //buttonLabels: ["OK", "Cancel"],

    }).then(function (input){
        if(input == null){
            return;
        }
        if (isNaN(input) || input === "" || input < 0 || input > 500) {
            ons.notification.alert('Invalid cocktail size!')
        } else {
            // Try to mix Cocktail
            let response = blockingHttpRequest("mixCocktail", idx+":"+input);
            if(response === "okay"){
                ons.notification.toast('Mixing cocktail ...', {
                    timeout: 2000
                })
            }
            else if(response === "blocked"){
                blockedAlert();
            }
            else {
                // server error response
            }
        }
    })
}

/**
 * Remove drink from drink settings
 * @param index
 */
let removeDrink = function(index) {
    ons.notification.confirm('Are you sure you want to remove this drink?')
        .then(function (response){
            if(response == true){
                drinks[index] = null;
                saveDrinksToMachine();
                fillSettings();
            }
            if(response == false){
                // Keep cocktail
            }
        })
}

/**
 * Fills the cocktail-list with cocktails in settings
 */
let fillCocktails = function(){
    let cocktailsHTML = document.getElementById("cocktails");
    let html = "";
    let idx = 0;
    let available;
    cocktails.forEach(function(cocktail){
        available = true;
        cocktail.ingredients.forEach(ingredient => {
            if(getDrinkByName(ingredient.drink.name) == null){
                available = false;
            }
        })

        if(available){
            html += "<ons-list-item class=\"input-items\" onclick='confirmCocktail("+idx+")' style='height: 70px'>\n" +
                "                    <label class=\"center\">\n" +
                cocktail.name +
                "                    </label>\n" +
                "                </ons-list-item>";
        }
        else {
            html += "<ons-list-item class=\"input-items\" onclick='cocktailNotAvailable("+idx+")' style='height: 70px'>\n" +
                "                    <label class=\"center\">\n" +
                cocktail.name +
                "                    </label>\n" +
                "                </ons-list-item>";
        }

        idx++;

    });
    cocktailsHTML.innerHTML = html;
}


/**
 * Fills the drink-list with drinks in settings
 */
let fillSettings = function() {

    for(let i = 0; i<4; i++){
        if(drinks[i] == null){
            document.getElementById("pos"+i).innerText = "Position "+ (i+1) +": position not configured"
            document.getElementById("pos"+i).setAttribute("style", "color: gray;");
        }
        else{
            document.getElementById("pos"+i).innerText = "Position " + (i+1) + ": "+drinks[i].name
        }
    }

    let cocktailsHTML = document.getElementById("manageCocktails");
    let html = "";
    let idx = 0;
    cocktails.forEach(function(cocktail){
        html += "<ons-list-item modifier=\"chevron\" onclick=\"setIndex("+idx+");fn.pushPage({'id': 'editCocktail.html', 'title': '"+cocktail.name+"'}, 'default')\">\n" +
            "                    <label class=\"center\">\n" +
                                     cocktail.name +
            "                    </label>\n" +
            "                </ons-list-item>";
        idx++;
    });

    html += "<ons-list-item onclick=\"setIndex(-1);fn.pushPage({'id': 'editCocktail.html', 'title': 'New Cocktail'}, 'default')\">\n" +
        "                    <label class=\"center\">\n" +
        "                           + add new cocktail " +
        "                    </label>\n" +
        "                </ons-list-item>";
    idx++;
    cocktailsHTML.innerHTML = html;

}

/**
 * Used to generate the settings page of a specific cocktail
 * @param idx index in cocktails array
 */
let setIndex = function(idx){
    cocktailSettingsIndex = idx;
}

let cocktailNotAvailable = function (){
    ons.notification.alert("Cocktail not available");
}

let isAnyDrinkAvailable = function(){
    for(let i = 0; i<4; i++){
        if(drinks[i] != null){
            return true;
        }
    }
    return false;
}

/**
 * Generates a settings page for a specific cocktail
 */
let fillCocktailEditPage = function() {
    if(cocktailSettingsIndex === -1){
        // Add new Cocktail
        let newCocktail = {name: "New Cocktail", ingredients: []};
        cocktails.push(newCocktail);
        cocktailSettingsIndex = cocktails.length-1;
        document.getElementById("deleteButton").innerHTML = "";
    }

    const idx = cocktailSettingsIndex;
    const cocktail = cocktails[idx];
    let ingredients = cocktails[idx].ingredients;
    document.getElementById("save").innerHTML = "<ons-button modifier=\"large\" onclick=\"changeCocktailSettings("+idx+");saveCocktailsToMachine()\">Save</ons-button>\n";
    document.getElementById("cocktailName").innerText = cocktail.name;
    let html = "";
    let content = document.getElementById("settingsContent")
    html += "<ons-list id='cocktailSettings'>" +
            "   <ons-list-header>NAME</ons-list-header>\n";
    html +=
            "   <ons-list-item class=\"input-items\">\n" +
            "       <label class=\"center\">\n" +
            "           <ons-input id=\"name\" modifier=\"underbar\" maxlength=\"auto\" value=\""+cocktail.name+"\"></ons-input>\n" +
            "       </label>\n" +
            "   </ons-list-item>";

    html += "   <ons-list-header>INGREDIENTS</ons-list-header>\n";

    let ingredientCount = 0;
    ingredients.forEach(function(ingredient){
        html += generateIngredient(ingredientCount, ingredient)
        ingredientCount++;
    });


    if(cocktail.ingredients.length < 4){
        html+=  "   <ons-list-item onclick='addIngredient("+idx+")' class=\"input-items\">\n" +
            "       <div class=\"left\"> " +
            "           <ons-icon icon=\"md-plus\" class=\"list-item__icon\"></ons-icon> " +
            "       </div>" +
            "   </ons-list-item>"
    }

    html += "</ons-list>";
    content.innerHTML = html;
}

/**
 * Function to generate one ingredient entry with 2 drop down select menus
 * @param ingCount position of the ingredient in the ingredient-array of the cocktail
 * @param ingredient ingredient object {drink, amount}
 * @returns {string} html-string for this ingredient
 */
let generateIngredient = function(ingCount, ingredient) {
    let html = "";
    html+=  "<ons-list-item class=\"input-items\">\n" +
            "   <label class=\"center\">\n" +
            "       <ons-select class=\"select\">\n" +
            "           <select id=\"ing"+ingCount+"\" class=\"select-input\">\n";

    let idx = 0;
    if(getDrinkByName(ingredient.drink.name) == null){
        // Drink for this cocktail is currently not available -> user can not change the settings. Used to simplify settings.
        document.getElementById("settingsContent").setAttribute("style", "pointer-events: none;");
        document.getElementById("save").innerHTML = "";
        ons.notification.alert('One or more drinks for this cocktail are currently not available on the machine. You can only delete this cocktail or cancel.')
        html += "<option selected>"+ingredient.drink.name+"</option>\"";
    }
    drinks.forEach(function(drink){
        if(drink != null){
            if(drink.name === ingredient.drink.name){
                html += "<option selected>"+drink.name+"</option>\"";
            }
            else {
                html += "<option>"+drink.name+"</option>\"";
            }
        }
        idx++;
    })

    html+=  "           </select>\n" +
            "       </ons-select>" +
            "   </label>\n" +
            "   <div class=\"right\">\n" +
            "       <text>amount in % &nbsp;</text>" +
            "       <ons-input type='number' id=\"ingAmount"+ingCount+"\" modifier=\"underbar\" value=\""+ingredient.amount+"\"min=\"0\"max=\"100\"></ons-input>" +
            "   </div>" +
            "</ons-list-item>";

    return html;
}

/**
 * Add an ingredient to the settings page of a cocktail
 * @param idx index of the cocktail in the cocktails-array
 */
let addIngredient = function(idx){
    if(!isAnyDrinkAvailable()){
        ons.notification.alert("No drinks configured");
        return;
    }
    changeCocktailSettings(idx);
    let newIngredient;

    for(let i = 0; i<4; i++){
        if(drinks[i] != null){
            newIngredient = {drink: drinks[i], amount:0};
            i = 4;
        }
    }
    cocktails[idx].ingredients.push(newIngredient);
    fillCocktailEditPage();
}

/**
 * Change the settings of a specific cocktail by collecting data from the elements of the settings-page
 * @param idx index of the cocktail in the cocktails-array
 */
let changeCocktailSettings = function(idx){
    let name = document.getElementById("name").value;
    if(name === ""){
        name = "New Cocktail"
    }
    cocktails[idx].name = name;

    let newIngredients = [];
    let drink;
    let amount;

    let i = 0;
    let htmlElement = document.getElementById("ing"+i);

    while(htmlElement != null) {
        drink = htmlElement.value;
        htmlElement = document.getElementById("ingAmount"+i);
        amount = Number(htmlElement.value);
        newIngredients.push({drink: getDrinkByName(drink), amount: amount});

        i++;
        htmlElement = document.getElementById("ing"+i);
    }

    cocktails[idx].ingredients = newIngredients;
}

let getDrinkByName = function(name) {
    let return_drink = null;
    drinks.forEach(function(drink){
        if(drink == null){
            // continue;
        }
        else if(name === drink.name){
            return_drink = drink;
        }
    })
    return return_drink;
}

/**
 * Used to dynamically load page content
 */
document.addEventListener('show', function(event) {
    let page = event.target;
    if (event.target.matches('#cocktail-page')) {
        fillCocktails()
    }
    if (event.target.matches('#settings-page')) {
        fillSettings()
    }
    if (event.target.matches('#editCocktail-page')) {
        fillCocktailEditPage();
    }
}, false);

let discardCocktailChanges = function() {
    cocktails = JSON.parse(JSON.stringify(cocktails_save))
}

let deleteCocktail = function() {
    ons.notification.confirm('Do you want to delete this cocktail?')
        .then((response) => {
            if(response){
                cocktails.splice(cocktailSettingsIndex, 1);
                saveCocktailsToMachine();
            }
        });
}


let saveDrinksToMachine = function() {
    let newDrinksJSON = JSON.stringify(drinks);

    cocktails.forEach(cocktail => {
        cocktail.ingredients.forEach(ingredient => {
            let ingredientDrink = getDrinkByName(ingredient.drink.name);
            if(ingredientDrink != null){
                ingredient.drink = ingredientDrink;
            }
        })
    });

    waitForResponse()

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "saveDrinks", true);
    xhr.send(newDrinksJSON);

    let response;
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            response = xhr.response;
            if(response === "okay"){
                drinks_save = JSON.parse(newDrinksJSON);
                saveCocktailsToMachine();
            }
            else if(response === "blocked"){
                blockedAlert();
            }
            else {
                // server unable to save settings to machine
            }
        }
        else {
            //throw new Error('Server responded with status code ' + xhr.status + ": " + xhr.response);
        }
    };
}

let saveCocktailsToMachine = function() {
    let newCocktailsJSON = JSON.stringify(cocktails)

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "saveCocktails", true);
    xhr.send(newCocktailsJSON);

    waitForResponse();

    let response;
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            response = xhr.response;
            if(response === "okay"){
                cocktails_save = JSON.parse(newCocktailsJSON)
                stopWaitingForResponse();
                let cancelButton = document.getElementById("cancelButton");
                if(cancelButton != null){
                    cancelButton.click()
                }
            }
            else if(response === "blocked"){
                stopWaitingForResponse();
                blockedAlert();
            }
            else {
                // server unable to save settings to machine
            }
        }
        else {
            //throw new Error('Server responded with status code ' + xhr.status + ": " + xhr.response);
        }
    };
}

let blockedAlert = function() {
    ons.notification.alert("Cocktailmachine not ready");
}

let editDrink = function(pos) {
    let name = "";
    if (drinks[pos] != null){
        name = drinks[pos].name;
    }
    ons.notification.prompt({
        message: "Position " + (pos+1),
        cancelable: true,
        defaultValue: name,
        title: "Enter name of the drink"

    }).then(function (input){
        if(input == null){
            return;
        }
        let newDrink = {name: input, position: pos}
        drinks[pos] = newDrink;
        document.getElementById("pos"+pos).setAttribute("style", "color: black;");
        saveDrinksToMachine();
        fillSettings();
    })
}

let resetSettings = function(){
    ons.notification.confirm("Are you sure you want to reset all settings?")
        .then((response) => {
            if(response){
                drinks_save = [null,null,null,null];
                drinks = [null,null,null,null];
                cocktails_save = [];
                cocktails = [];

                saveDrinksToMachine();
                fillSettings();
            }
        });
}

let waitForResponse = function () {
    document.getElementById("waitForServer").show();
}

let stopWaitingForResponse = function () {
    document.getElementById("waitForServer").hide();
}

let blockingHttpRequest = function (url, data){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);
    xhr.send(data);
    return xhr.response;
}

/**
 * Get current drink and cocktail configurations from server
 */
let getCurrentSettings = function (){
    let drinkSettings = blockingHttpRequest("getDrinkSettings", "");
    let cocktailSettings = blockingHttpRequest("getCocktailSettings", "")

    drinks_save = JSON.parse(drinkSettings);
    drinks = JSON.parse(drinkSettings);
    cocktails_save = JSON.parse(cocktailSettings);
    cocktails = JSON.parse(cocktailSettings);
}

let command = function(cmd){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "cmd", true);
    xhr.send(cmd);
    let response;
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            response = xhr.response;
            if (response === "okay") {
                ons.notification.alert("Deadlock will get triggered on next Cocktail");
            }
        } else {
            // Server error
        }
    }
};

getCurrentSettings();
