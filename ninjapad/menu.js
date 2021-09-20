var isMenuOpen;

function mainMenu() {
    const upload = "uploadROM()";
    const save = "saveState();";
    const load = "loadState();";
    const reset = "reset();"
    const about = "showCredits()";
    return createMenu(null,
        link("Load ROM", js=upload, hide=SINGLE_ROM),
        link("Save State", js=save),
        link("Load State", js=load),
        link("Reset", js=reset),
        link("About", js=about)
    );
}

function loadState() {
    const hash = sha256(emulator.getROMData());
    const data = localStorage.getItem(hash);
    if (!data) {
        showError("No save data");
        return;
    }
    try {
        emulator.loadState(data);
        resumeEmulation();
    }
    catch (e) {
        showError(`Error<br/><br/>${e.message}`);
        DEBUG && console.log(e);
    }
}

function saveState() {
    const hash = sha256(emulator.getROMData());
    const data = emulator.saveState();
    try {
        localStorage.setItem(hash, data);
        resumeEmulation();
    }
    catch (e) {
        showError(`Error<br/><br/>${e.message}`);
        DEBUG && console.log(e);
    }
}

function reset() {
    emulator.reloadROM();
    resumeEmulation();
}

function uploadROM() {
    jQElement.upload.trigger("click");

    const inputElement = document.getElementById("upload");
    inputElement.addEventListener("change", handleFiles, false);

    function handleFiles() {
        let f = document.getElementById('upload').files[0];
        emulator.loadROM(f);
    }
}

function showError(msg) {
    $("#pauseScreenContent").html(
        html("div", "error", msg)
    );
    assign(preventDefault, "pauseScreenContent");
    assign(showMainMenu, "OSD", "end");
}

function showCredits() {
    let link = "https://twitter.com/ninjadynamics";
    $("#pauseScreenContent").html(
        html(
            "div", "about",
            `Follow me on Twitter:<br/>
            <a href="${link}" target="_blank">
            <font color="yellow">ninjadynamics</font>
            </a>
            `
        )
    );
}

function showMainMenu() {
    $("#pauseScreenContent").html(
        mainMenu()
    );
    allowInteraction("pauseScreenContent");
    assign(preventDefault, "OSD");
}

function openMainMenu() {
    pauseEmulation(
        html("span", "pauseScreenContent", mainMenu())
    );
    allowInteraction("pauseScreenContent");
    assign(preventDefault, "OSD");
    isMenuOpen = true;
}

function toggleMenu() {
    if (!cannotResume && isMenuOpen) {
        resumeEmulation();
        isMenuOpen = false;
        return;
    }
    openMainMenu();
}
