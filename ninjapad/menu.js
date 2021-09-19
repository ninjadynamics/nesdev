var isMenuOpen;


function loadState() {
    const hash = sha256(emulator.getROMData());
    const data = localStorage.getItem(hash);
    emulator.loadState(data);
}

function saveState() {
    const hash = sha256(emulator.getROMData());
    const data = emulator.saveState();
    localStorage.setItem(hash, data);
}

function reset() {
    emulator.reloadROM();
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

function showMenuOptions() {
    const upload = "uploadROM()";
    const save = "saveState(); resumeEmulation();";
    const load = "loadState(); resumeEmulation();";
    const reset = "reset(); resumeEmulation();"
    const about = "showCredits()";
    pauseEmulation(
        html(
            "span", "pauseScreenContent",
            createMenu(null,
                link("Load ROM", js=upload, hide=SINGLE_ROM),
                link("Save State", js=save),
                link("Load State", js=load),
                link("Reset", js=reset),
                link("About", js=about)
            )
        )
    );
}

function toggleMenu() {
    if (!cannotResume && isMenuOpen) {
        resumeEmulation();
        isMenuOpen = false;
        return;
    }
    showMenuOptions();
    allowInteraction("pauseScreenContent");
    assign(preventDefault, "OSD");
    isMenuOpen = true;
}
