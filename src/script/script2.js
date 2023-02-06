let cocktails = JSON.parse("[{\"name\":\"Vodka-Energie\",\"ingredients\":[{\"name\":\"Vodka\",\"amount\":40},{\"name\":\"Energie-Drink\",\"amount\":160}]},{\"name\":\"Gin-Tonic\",\"ingredients\":[{\"name\":\"Gin\",\"amount\":40},{\"name\":\"Tonic Water\",\"amount\":160}]},{\"name\":\"Vodka Lemon\",\"ingredients\":[{\"name\":\"Vodka\",\"amount\":40},{\"name\":\"Tonic Water\",\"amount\":160}]}]");
let drinks = JSON.parse("[{\"name\":\"Vodka\",\"position\":1},{\"name\":\"Gin\",\"position\":2},{\"name\":\"Tonic Water\",\"position\":3},{\"name\":\"Energie\",\"position\":4}]")

window.onload = function() {
    fillCocktails();
};

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

let editCocktail = function(index) {
    let modal = document.getElementById("editCocktailModal");
    let cocktail = {}
    modal.show()

}
let hideCocktailModal = function() {
    document.getElementById("editCocktailModal").hide();
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

let fillSettings = function() {
    document.getElementById("pos1").innerText = "Position 1: "+drinks[0].name
    document.getElementById("pos2").innerText = "Position 2: "+drinks[1].name
    document.getElementById("pos3").innerText = "Position 3: "+drinks[2].name
    document.getElementById("pos4").innerText = "Position 4: "+drinks[3].name
}

let fillCocktails = function(){
    let cocktailsHTML = document.getElementById("cocktails");
    let html = "";
    let idx = 0;
    cocktails.forEach(function(cocktail){
        html += "   <ons-card onclick=\"confirmCocktail("+idx+")\">\n" +
            "           <div class=\"title\">"+cocktail.name+"</div>\n" +
            "       </ons-card>";
        idx++;
    });
    cocktailsHTML.innerHTML = html;
    ons.compile(cocktailsHTML);

}