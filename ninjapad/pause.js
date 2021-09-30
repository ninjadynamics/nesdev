const pause = function() {
    var state = {
        isEmulationPaused: false,
        cannotResume: false
    };

    var pauseScreen = {
        visibility: "hidden",
        content: ""
    };

    function pauseText() {
        let msg = "Emulation paused";
        let resumeMsg = utils.isMobileDevice() ? "Tap" : "Click";
        resumeMsg += " to resume";
        return utils.html("span", "pauseScreenContent", msg + "<br/>" + resumeMsg);
    }

    return {
        state: state,

        pauseScreen: pauseScreen,

        pauseEmulation: function(content=null) {
            emulator.pause();
            pauseScreen.visibility = "visible";
            pauseScreen.content = content || pauseText();
            jQElement.osd.empty();
            jQElement.osd.append(pauseScreen.content);
            jQElement.osd.css("visibility", pauseScreen.visibility);
            state.isEmulationPaused = true;
            utils.assign(null, "pauseScreenContent");
            utils.assignNoPropagation(pause.resumeEmulation, "OSD", "end");
            DEBUG && console.log("Emulation paused");
        },

        resumeEmulation: function(event) {
            if (event) event.stopPropagation();
            if (state.cannotResume) return;
            emulator.resume();
            pauseScreen.visibility = "hidden";
            jQElement.osd.css("visibility", pauseScreen.visibility);
            state.isEmulationPaused = false;
            menu.state.isOpen = false;
            DEBUG && console.log("Emulation resumed");
        }
    };
}();
