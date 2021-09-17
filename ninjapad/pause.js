// Pause screen
var emulationPaused = false;
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
    DEBUG && console.log("Emulation paused");
    emulationPaused = true;
    emulator.pause();
    pauseScreen.visibility = "visible";
    pauseScreen.content = content || pauseText();
    jQElement.osd.empty();
    jQElement.osd.append(pauseScreen.content);
    jQElement.osd.css("visibility", pauseScreen.visibility);
    assign(preventDefault, "pauseScreenContent");
}

function resumeEmulation() {
    DEBUG && console.log("Emulation resumed");
    if (cannotResume) return;
    emulationPaused = false;
    emulator.resume();
    pauseScreen.visibility = "hidden";
    jQElement.osd.css("visibility", pauseScreen.visibility);
}
