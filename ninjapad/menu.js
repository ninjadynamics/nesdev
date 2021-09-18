var isMenuOpen;

function loadState(s) {
    nes.fromJSON(JSON.parse(s));
}

function saveState() {
    return JSON.stringify(nes.toJSON());
}

function uploadROM(event) {
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
    pauseEmulation(
        html(
            "span", "pauseScreenContent",
            `Follow me on Twitter:<br/>
            <a href="${link}" target="_blank">
            ninjadynamics
            </a>
            `
        )
    );
}

function toggleMenu() {
    if (!cannotResume && isMenuOpen) {
        resumeEmulation();
        isMenuOpen = false;
        return;
    }
    isMenuOpen = true;
    showCredits();
    allowInteraction("pauseScreenContent");
    assign(preventDefault, "OSD");
}
