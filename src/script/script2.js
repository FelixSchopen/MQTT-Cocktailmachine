let cocktails_str = "[{\"name\":\"Vodka-Energie\",\"ingredients\":[{\"drink\":{\"name\":\"Vodka\",\"position\":1},\"amount\":40},{\"drink\":{\"name\":\"Energie\",\"position\":4},\"amount\":160}],\"ingredient_cout\":2},{\"name\":\"Gin-Tonic\",\"ingredients\":[{\"drink\":{\"name\":\"Gin\",\"position\":2},\"amount\":40},{\"drink\":{\"name\":\"Tonic Water\",\"position\":3},\"amount\":160}],\"ingredient_cout\":2},{\"name\":\"Vodka Lemon\",\"ingredients\":[{\"drink\":{\"name\":\"Vodka\",\"position\":1},\"amount\":40},{\"drink\":{\"name\":\"Tonic Water\",\"position\":3},\"amount\":160}],\"ingredient_cout\":2}]";
let drinks_str = "[{\"name\":\"Vodka\",\"position\":1},{\"name\":\"Gin\",\"position\":2},{\"name\":\"Tonic Water\",\"position\":3},{\"name\":\"Energie\",\"position\":4}]";

let cocktails = JSON.parse(cocktails_str);
let drinks = JSON.parse(drinks_str);

let cocktails_save = JSON.parse(cocktails_str)
let drinks_save = JSON.parse(drinks_str);

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

let updateCocktails = function () {

}

/**
 * Alert that shows when user requests a drink
 */
let confirmCocktail = function() {
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
        if (isNaN(input) || input === "" || input < 100 || input > 500) {
            ons.notification.alert('Invalid cocktail size!')
        } else {
            // Try to mix Cocktail
            ons.notification.toast('Mixing cocktail ...', {
                timeout: 2000
            })
        }
    })
}

/**
 * Remove cocktail from cocktail settings
 * @param index
 */
let removeCocktail = function(index) {
    ons.notification.confirm('Are you sure you want to remove this cocktail?')
        .then(function (response){
            if(response == true){
                cocktails[index] = null;
                ons.notification.alert("Removed cocktail");
            }
            if(response == false){
                // Keep cocktail
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
                console.log(index);
                drinks[index] = null;
                fillSettings();
                ons.notification.alert("Removed drink");
            }
            if(response == false){
                // Keep cocktail
            }
        })
}

let editDrink = function(index) {
    let drinks = JSON.parse("[{\"name\":\"Vodka\",\"position\":1},{\"name\":\"Gin\",\"position\":2},{\"name\":\"Tonic Water\",\"position\":3},{\"name\":\"Energie\",\"position\":4}]")
    let modal = document.getElementById("editDrinkModal");
    let cocktail = {}

    let settings = document.getElementById("drinkSettings");
    settings.innerHTML = "  <div class=\"left\">\n" +
        "                       <ons-icon icon=\"md-wine\" class=\"list-item__icon\"></ons-icon>\n" +
        "                   </div>\n" +
        "                   <label class=\"center\">\n" +
        "                       <ons-input id=\"name-input\" float maxlength=\"20\" placeholder=\"Name\"></ons-input>\n" +
        "                   </label>"
    modal.show()
}
let hideDrinkModal = function() {
    document.getElementById("editDrinkModal").hide();
}

/**
 * Fills the cocktail-list with cocktails in settings
 */
let fillCocktails = function(){
    let cocktailsHTML = document.getElementById("cocktails");
    let html = "";
    let idx = 0;
    cocktails.forEach(function(cocktail){
        html += "<ons-list-item class=\"input-items\" onclick='confirmCocktail("+idx+")' style='height: 70px'>\n" +
            "                    <label class=\"center\">\n" +
            cocktail.name +
            "                    </label>\n" +
            "                </ons-list-item>";
        idx++;
    });
    cocktailsHTML.innerHTML = html;
}


/**
 * Fills the drink-list with drinks in settings
 */
let fillSettings = function() {

    if(drinks[0] == null){
        document.getElementById("pos0").innerText = "Position 1: position not configured"
        document.getElementById("pos0").setAttribute("style", "color: gray;");

    }
    else{
        document.getElementById("pos0").innerText = "Position 1: "+drinks[0].name
    }

    if(drinks[1] == null){
        document.getElementById("pos1").innerText = "Position 2: position not configured"
        document.getElementById("pos1").setAttribute("style", "color: gray;");

    }
    else {
        document.getElementById("pos1").innerText = "Position 2: "+drinks[1].name
    }

    if(drinks[2] == null){
        document.getElementById("pos2").innerText = "Position 3: position not configured"
        document.getElementById("pos2").setAttribute("style", "color: gray;");

    }
    else {
        document.getElementById("pos2").innerText = "Position 3: "+drinks[2].name
    }

    if(drinks[3] == null){
        document.getElementById("pos3").innerText = "Position 4: position not configured"
        document.getElementById("pos3").setAttribute("style", "color: gray;");

    }
    else {
        document.getElementById("pos3").innerText = "Position 4: "+drinks[3].name
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
    cocktailsHTML.innerHTML = html;

}

/**
 * Used to generate the settings page of a specific cocktail
 * @param idx index in cocktails array
 */
let setIndex = function(idx){
    cocktailSettingsIndex = idx;
}

/**
 * Generates a settings page for a specific cocktail
 */
let fillCocktailEditPage = function() {
    console.log(cocktails)
    const idx = cocktailSettingsIndex;
    const cocktail = cocktails[idx];
    let ingredients = cocktails[idx].ingredients;
    document.getElementById("save").innerHTML = "<ons-button onclick=\"saveCocktail("+idx+")\">Save</ons-button>\n"
    document.getElementById("cocktailName").innerText = cocktail.name;
    let html = "";
    let content = document.getElementById("settingsContent")
    html += "<ons-list id='cocktailSettings'>" +
            "<ons-list-header>NAME</ons-list-header>\n";
    html +=
            "<ons-list-item class=\"input-items\">\n" +
            "   <label class=\"center\">\n" +
            "       <ons-input id=\"name\" float maxlength=\"20\" placeholder=\""+cocktail.name+"\"></ons-input>\n" +
            "   </label>\n" +
            "</ons-list-item>";

    html += "<ons-list-header>INGREDIENTS</ons-list-header>\n";

    let ingredientCount = 0;
    ingredients.forEach(function(ingredient){
        html += generateIngredient(ingredientCount, ingredient)
        ingredientCount++;
    });

    html+=  "<ons-list-item onclick='addIngredient("+idx+")' class=\"input-items\">\n" +
            "<div class=\"left\"> " +
                "<ons-icon icon=\"md-plus\" class=\"list-item__icon\"></ons-icon> " +
            "</div>" +
            "</ons-list-item>"

        html += "</ons-list>";
    content.innerHTML = html;
}

/**
 * Function to generate one ingredient
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

    drinks.forEach(function(drink){
        if(drink.name === ingredient.drink.name){
            html += "<option selected>"+drink.name+"</option>\"";
        }
        else {
            html += "<option>"+drink.name+"</option>\"";
        }
    })

    html+=  "            </select>\n" +
        "       </ons-select>" +
        "   </label>\n" +
        "<div class=\"right\">\n" +
        "<text>amount in % &nbsp;</text>" +
        "       <ons-input type='number' id=\"ingAmount"+ingCount+"\" modifier=\"underbar\" value=\""+ingredient.amount+"\"min=\"0\"max=\"100\"></ons-input>" +
        "</div>" +
        "</ons-list-item>";
    return html;
}

/**
 * Add an ingredient to the settings page of a cocktail
 * @param idx index of the cocktail in the cocktails-array
 */
let addIngredient = function(idx){
    let newIngredient = {drink: drinks[0], amount:0};
    cocktails[idx].ingredients.push(newIngredient);
    fillCocktailEditPage();
}

/**
 * Save the settings of a specific cocktail
 */
let saveCocktail = function(idx){
    let elements = document.getElementById("cocktailSettings").getElementsByTagName("ons-list-item");
    let len = elements.length;
    let name = document.getElementById("name").value;
    console.log("Cocktail name: " + name);

    let newIngredients = [];
    let drink;
    let amount;

    for(let i = 0; i<len-1; i++){
        let el = document.getElementById("ing"+i);
        drink = el.value;
        el = document.getElementById("ingAmount"+i);
        amount = el.value;
        console.log("Drink: "+ drink + " Amount: "+ amount)
        //newIngredients.push()
    }
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
        //fillSettings()
    }
    if (event.target.matches('#editCocktail-page')) {
        cocktails = JSON.parse(JSON.stringify(cocktails_save))
        fillCocktailEditPage();
    }
}, false);

