function getSettings() {
    var settingsOptions = [
        'summerQuarter',
    ], 
        value;
    settingsOptions.forEach(function(setting) {
        value = JSON.parse(localStorage.getItem(setting));
        checkSetting(setting, value);
    });
}

function checkSetting(setting, value) {
    console.log("Setting: "+setting);
    if (setting === "summerQuarter") {
//        toggleSummerQuarter(value);
    }
}

//function toggleSummerQuarter(toggled) {
//    if (toggled) {
//        $(".summer-quarter").show();
//        localStorage.setItem("summerQuarter", true);
//    } else {
//        $(".summer-quarter").hide();
//        $(".summer-quarter").sortable({
//            disabled: true
//        });
//        localStorage.setItem("summerQuarter", false);
//    }
//}

