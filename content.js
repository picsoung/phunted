// content.js
window.addEventListener ("load", myMain, false);

function myMain (evt) {
    // DO YOUR STUFF HERE.
    chrome.storage.sync.get("phunted", function (obj) {
        // console.log("OBJ",obj);
        var site = obj.phunted;
        $("#name").val(site.title);
        $("#url").val(site.link);
        // console.log($("#name"));
    });
}
