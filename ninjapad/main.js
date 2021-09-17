// jQuery Objects
var jQElement;

// Emulator interface
var emulator;

function loadNinjaPad() {
    jQElement = {
        ninjaPad:     $("#ninjaPad"),
        controller:   $("#CONTROLLER"),
        analogSwitch: $("#analogSwitch"),
        loadROM:      $("#loadROM"),
        upload:       $("#upload"),
        analogStick:  $("#ANALOG_STICK"),
        analog:       $("#ANALOG"),
        dpad:         $("#DPAD"),
        osd:          $("#OSD"),
        screen:       $("#" + SCREEN),
    };

    // Page setup
    setPageLayout();

    // Assign function calls to touch events
    assign(toggleFullScreen, SCREEN, "end");
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
    loadNinjaPad();
});

$(document).ready(function() {
    DEBUG && console.log("Document ready event");
    emulator = INTERFACE[EMULATOR];
    emulator.initialize("main.nes");
    loadNinjaPad();
});
