const menu = function() {
    var state = { isOpen: false };

    function allowUserInteraction(ontap=null) {
        utils.allowInteraction("pauseScreenContent");
        utils.assignNoPropagation(ontap, "OSD", ontap && "end");
    }

    function preventUserInteraction(ontap=null) {
        utils.assign(null, "pauseScreenContent");
        utils.assignNoPropagation(ontap, "OSD", ontap && "end");
    }

    function showError(msg) {
        $("#pauseScreenContent").html(
            utils.html("div", "error", msg)
        );
        preventUserInteraction(returnToMainMenu);
    }

    function mainMenu() {
        const upload = "menu.uploadROM()";
        const save = "menu.saveState();";
        const load = "menu.loadState();";
        const reset = "menu.reset();"
        const about = "menu.showCredits()";
        return utils.createMenu(null,
            utils.link("Load ROM", js=upload, hide=SINGLE_ROM),
            utils.link("Save State", js=save),
            utils.link("Load State", js=load),
            utils.link("Reset", js=reset),
            utils.link("About", js=about)
        );
    }

    function openMainMenu() {
        pause.pauseEmulation(
            utils.html("span", "pauseScreenContent", mainMenu())
        );
        allowUserInteraction();
        state.isOpen = true;
    }

    function returnToMainMenu(event) {
        event.stopPropagation();
        $("#pauseScreenContent").html(
            mainMenu()
        );
        allowUserInteraction();
    }

    return {
        state: state,

        loadState: function() {
            const hash = sha256(emulator.getROMData());
            const data = localStorage.getItem(hash);
            if (!data) {
                showError("No save data");
                return;
            }
            try {
                emulator.loadState(
                    uint8ToUtf16.decode(data)
                );
                pause.resumeEmulation();
            }
            catch (e) {
                showError(`Error<br/><br/>${e.message}`);
                DEBUG && console.log(e);
            }
        },

        saveState: function() {
            const hash = sha256(emulator.getROMData());
            const data = emulator.saveState();
            try {
                const optimizedData = uint8ToUtf16.encode(data);
                localStorage.setItem(hash, optimizedData);
                pause.resumeEmulation();
            }
            catch (e) {
                showError(`Error<br/><br/>${e.message}`);
                DEBUG && console.log(e);
            }
        },

        reset: function() {
            emulator.reloadROM();
            pause.resumeEmulation();
        },

        uploadROM: function() {
            jQElement.upload.trigger("click");

            const inputElement = document.getElementById("upload");
            inputElement.addEventListener("change", handleFiles, false);

            function handleFiles() {
                let saveData = null;
                if (emulator.isROMLoaded()) {
                    saveData = emulator.saveState();
                }
                let f = document.getElementById('upload').files[0];
                let reader = new FileReader();
                reader.onload = function () {
                    try {
                        emulator.loadROMData(reader.result);
                        pause.resumeEmulation();
                    }
                    catch (e) {
                        if (saveData) {
                            emulator.reloadROM();
                            emulator.loadState(saveData);
                        }
                        showError(`Error<br/><br/>${e.message.strip(".")}`);
                        DEBUG && console.log(e);
                    }
                }
                reader.readAsBinaryString(f);
            }
        },

        showCredits: function() {
            $("#pauseScreenContent").html(
                utils.html("div", "about", ABOUT)
            );
            allowUserInteraction(returnToMainMenu)
        },

        toggleMenu: function() {
            if (!pause.state.cannotResume && state.isOpen) {
                pause.resumeEmulation();
                state.isOpen = false;
                return;
            }
            openMainMenu();
        }
    }
}();
