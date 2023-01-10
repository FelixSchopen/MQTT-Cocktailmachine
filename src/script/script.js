window.onload = function () {

    document.getElementById("btn1").addEventListener("click", event => {
        console.log("Button pressed!")
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "btn1", true);
        xhr.send();
        xhr.onload = function () {
            if (xhr.status !== 200) {
                throw new Error('Server responded with status code ' + xhr.status + ": " + xhr.response);
            }
        }
    });
}

