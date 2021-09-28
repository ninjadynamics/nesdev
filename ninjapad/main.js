// jQuery Objects
var jQElement;

// Emulator interface
var emulator;

function loadNinjaPad() {
    jQElement = {
        gamepad:        $("#GAMEPAD"),
        controller:     $("#GAMEPAD-BUTTONS"),
        analogSwitch:   $("#analogSwitch"),
        menu:           $("#menu"),
        upload:         $("#upload"),
        analogStick:    $("#ANALOG_STICK"),
        analog:         $("#ANALOG"),
        dpad:           $("#DPAD"),
        osd:            $("#OSD"),
        screen:         $("#" + SCREEN),
    };

    // Page setup
    setPageLayout();

    // Assign function calls to touch events
    assign(toggleFullScreen, SCREEN, "end");
    assign(menu, "menu", "start", "end");
    assign(analogSwitch, "analogSwitch", "start", "end");
    assign(buttonPress, "GAMEPAD-BUTTONS", "start", "move", "end");
    assign(analogTouch, "ANALOG_STICK", "start", "move", "end");
    assign(preventDefault, "ninjaPad");
}

$(document).ready(function() {
    DEBUG && console.log("Document ready event");

    // Pause on loss of focus
    $(window).blur(function() {
        !isEmulationPaused && isMobileDevice() && pauseEmulation();
    });

    // Reload layout on orientation change
    $(window).resize(function() {
        DEBUG && console.log("Window resize event");
        loadNinjaPad();
    });

    $(window).keyup(function(e) {
      if (e.code == "Escape") toggleMenu();
    });

    emulator = INTERFACE[EMULATOR];
    emulator.initialize("main.nes");
    loadNinjaPad();
});
