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
    assign(preventDefault, "pauseScreenContent");
    assign(resumeEmulation, "OSD", "end");
    isEmulationPaused = true;
    DEBUG && console.log("Emulation paused");
}

function resumeEmulation() {
    if (cannotResume) return;
    emulator.resume();
    pauseScreen.visibility = "hidden";
    jQElement.osd.css("visibility", pauseScreen.visibility);
    isEmulationPaused = false;
    DEBUG && console.log("Emulation resumed");
}
