// jQuery Objects
var ninjaPad;
var controller;
var analogStick;
var gameScreen;
var osd;

// Emulator interface
var emulator;

function loadNinjaPad(gameScreenId) {
    ninjaPad    = $("#ninjaPad");
    controller  = $("#CONTROLLER");
    analogStick = $("#ANALOG_STICK");
    osd         = $("#OSD");
    gameScreen  = $("#" + gameScreenId);
    emulator    = INTERFACE[EMULATOR];

    // Page setup
    setPageLayout();

    // Assign function calls to touch events
    assign(toggleFullScreen, gameScreenId, "end");
    assign(uploadROM, "loadROM", "start", "end");
    assign(analogSwitch, "analogSwitch", "start", "end");
    assign(buttonPress, "CONTROLLER", "start", "move", "end");
    assign(analogTouch, "ANALOG_STICK", "start", "move", "end");
    assign(preventDefault, "ninjaPad");
    assign(resumeEmulation, "OSD", "end");
}

// Pause on loss of focus
window.onblur=function(event){
    !emulationPaused && isMobileDevice() && pauseEmulation();
}

// Reload layout on orientation change
$(window).resize(function() {
    DEBUG && console.log("Window resize event");
    loadNinjaPad("gameScreen");
});

$(document).ready(function() {
    DEBUG && console.log("Document ready event");
    loadNinjaPad("gameScreen");
    nes_load_url(GAME_SCREEN, ROMS_DIRECTORY + "main.nes");
});
