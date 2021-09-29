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
    layout.setPageLayout();

    // Assign function calls to touch events
    assign(gamepad.toggleMenu, "menu", "start", "end");
    assign(gamepad.analogSwitch, "analogSwitch", "start", "end");
    assign(gamepad.buttonPress, "GAMEPAD-BUTTONS", "start", "move", "end");
    assign(gamepad.analogTouch, "ANALOG_STICK", "start", "move", "end");
    assign(gamepad.toggleFullScreen, SCREEN, "end");
    assign(null, "GAMEPAD");
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

    emulator = interface[EMULATOR];
    emulator.initialize("main.nes");
    loadNinjaPad();
});
