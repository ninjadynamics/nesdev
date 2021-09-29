// Pause screen
var isEmulationPaused = false;
var cannotResume = false;
var pauseScreen = {
    visibility: "hidden",
    content: ""
};

function pauseText() {
    let msg = "Emulation paused";
    let resumeMsg = isMobileDevice() ? "Tap" : "Click";
    resumeMsg += " to resume";
    return html("span", "pauseScreenContent", msg + "<br/>" + resumeMsg);
}

function pauseEmulation(content=null) {
    emulator.pause();
    pauseScreen.visibility = "visible";
    pauseScreen.content = content || pauseText();
    jQElement.osd.empty();
    jQElement.osd.append(pauseScreen.content);
    jQElement.osd.css("visibility", pauseScreen.visibility);
    isEmulationPaused = true;
    assign(null, "pauseScreenContent");
    assignNoPropagation(resumeEmulation, "OSD", "end");
    DEBUG && console.log("Emulation paused");
}

function resumeEmulation(event) {
    if (event) event.stopPropagation();
    if (cannotResume) return;
    emulator.resume();
    pauseScreen.visibility = "hidden";
    jQElement.osd.css("visibility", pauseScreen.visibility);
    isEmulationPaused = false;
    isMenuOpen = false;
    DEBUG && console.log("Emulation resumed");
}
