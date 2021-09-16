// jQuery Objects
var ninjaPad;
var controller;
var analogStick;
var gameScreen;
var osd;

// Emulator interface
var emulator;

function loadNinjaPad(gameScreenId) {
    ninjaPad = $("#ninjaPad");
    gameScreen  = $("#" + gameScreenId);
    controller  = $("#CONTROLLER");
    analogStick = $("#ANALOG_STICK");
    osd         = $("#OSD");

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
    loadNinjaPad("gameScreen");
});

$(document).ready(function() {
    loadNinjaPad("gameScreen");
    nes_load_url(GAME_SCREEN, ROMS_DIRECTORY + "main.nes");
});
