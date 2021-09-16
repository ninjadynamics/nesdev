// Handle single-touch multiple button presses
const MULTIPRESS = {
    "UR": ["BUTTON_UP",   "BUTTON_RIGHT"],
    "DR": ["BUTTON_DOWN", "BUTTON_RIGHT"],
    "UL": ["BUTTON_UP",   "BUTTON_LEFT" ],
    "DL": ["BUTTON_DOWN", "BUTTON_LEFT" ],
    "AB": ["BUTTON_A",    "BUTTON_B"    ]
};

const DPAD_BUTTONS = [
    ["BUTTON_LEFT"                ],
    ["BUTTON_UP",   "BUTTON_LEFT" ],
    ["BUTTON_UP",                 ],
    ["BUTTON_UP",   "BUTTON_RIGHT"],
    ["BUTTON_RIGHT"               ],
    ["BUTTON_DOWN", "BUTTON_RIGHT"],
    ["BUTTON_DOWN"                ],
    ["BUTTON_DOWN", "BUTTON_LEFT" ],
]

// This object is necessary to handle the user
// sliding their finger from one button to another
var childButton = {};

var analog = {
    active: false,
    touchX: undefined,
    touchY: undefined,
    deltaX: undefined,
    deltaY: undefined,
    padBtn: undefined
};

// Pause
const pauseMsg = "Emulation paused";
var emulationPaused = false;
var cannotResume = false;

// jQuery Objects
var ninjaPad;
var controller;
var analogStick;
var gameScreen;
var osd;

function isButtonDown(eventType) {
    return eventType.endsWith("start") || eventType.endsWith("move");
}

function fnNesButtonPress(eventType) {
    if (isButtonDown(eventType)) {
        return nes.buttonDown;
    }
    return nes.buttonUp;
}

function vw(v) {
  let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (v * w) / 100;
}

function dist(dx, dy) {
    return Math.sqrt((dx * dx) + (dy * dy));
}

function angle(dx, dy) {
    return Math.atan2(dy, dx);
}

function pressButtons(fn, buttons) {
    for (const b of buttons) {
        fn(1, eval("jsnes.Controller." + b));
    }
}

function analogReset(element) {
    element.css("transform", "translate(0, 0)");
}

function analogTouch(event) {
    event.preventDefault();
    event.stopPropagation();
    for (const touch of event.changedTouches) {
        // Ignore any touches where the target
        // element doesn't match the source element
        if (touch.target.id != event.target.id) continue;

        switch (event.type) {
            case "touchstart":
                analog.touchX = touch.clientX;
                analog.touchY = touch.clientY;
                break;

            case "touchmove":
                analog.deltaX = touch.clientX - analog.touchX;
                analog.deltaY = touch.clientY - analog.touchY;

                let r = angle(analog.deltaX, analog.deltaY);
                let d = Math.min(vw(10), dist(analog.deltaX, analog.deltaY));

                let dx = Math.cos(r) * d;
                let dy = Math.sin(r) * d;
                analogStick.css(
                    "transform",
                    "translate(" + dx + "px, " + dy + "px)"
                );
                let btnIndex = Math.floor(((180 + (45/2) + (r * 180 / Math.PI)) % 360) / 45);
                analog.padBtn && pressButtons(nes.buttonUp, analog.padBtn);
                analog.padBtn = d < vw(DEADZONE) ? null : DPAD_BUTTONS[btnIndex];
                analog.padBtn && pressButtons(nes.buttonDown, analog.padBtn);
                break;

            default:
                analog.padBtn && pressButtons(nes.buttonUp, analog.padBtn);
                analogReset(analogStick);
        }
    }
}

function buttonPress(event) {
    // Prevent all the shenanigans that happen with a "long-press" on mobile
    event.preventDefault();

    // Get the source element
    target = event.target;

    // Handle the touch
    for (const touch of event.changedTouches) {
        // Ignore any touches where the target
        // element doesn't match the source element
        if (touch.target.id != target.id) continue;
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // Get the element (either a button or the empty area of the gamepad)
        // the user is physically touching right now
        let element = $(document.elementFromPoint(touch.clientX, touch.clientY))[0];

        // If it's a new touch, set the child button to its parent
        if (event.type == "touchstart") {
            childButton[target.id] = element;
        }
        // Otherwise, if the user is sliding its finger from one button to another
        // or simply stops touching the screen with that finger
        else if (childButton[target.id].id != element.id) {
        //else if (element.id && childButton[target.id].id != element.id) {
            // Check which button (if any) the user had its finger on previously
            let lastButton = childButton[target.id];
            // If the user was actually pressing a button before
            if (lastButton.id.startsWith("BUTTON")) {
                // Tell the emulator to release that button
                nes.buttonUp(1, eval("jsnes.Controller." + lastButton.id));
                $(lastButton).css("border-style", "outset");
                DEBUG && console.log("Released", lastButton.id); // Debug
            }
            // Otherwise, if it was a multipress
            else if (lastButton.id.startsWith("MULTI")) {
                // Get buttons
                let key = lastButton.id.split("_").pop();
                for (const d of MULTIPRESS[key]) {
                    nes.buttonUp(1, eval("jsnes.Controller." + d));
                }
                $(lastButton).css("background-color", "transparent");
                DEBUG && console.log("Released", lastButton.id); // Debug
            }
            // Update the child button to be the one the user is touching right now
            childButton[target.id] = element;
        }

        // If the user is actually interacting a button right now
        if (element.id.startsWith("BUTTON")) {

            // Get the correct function call
            let fn = fnNesButtonPress(event.type)

            // Send that button interaction to the emulator
            fn(1, eval("jsnes.Controller." + element.id));

            // Show button presses / releases
            if (isButtonDown(event.type)) {
                $(element).css("border-style", "inset");
                DEBUG && console.log("Pressed", element.id); // Debug
            }
            else {
                $(element).css("border-style", "outset");
                DEBUG && console.log("Released", element.id);  // Debug
            }
        }
        // Otherwise, if it's actually two buttons at the same time
        else if (element.id.startsWith("MULTI")) {

            // Get the correct function call
            let fn = fnNesButtonPress(event.type)

            // Get buttons
            let key = element.id.split("_").pop();
            for (const d of MULTIPRESS[key]) {
                fn(1, eval("jsnes.Controller." + d));
            }

            // Resume emulation and show button presses / releases
            if (isButtonDown(event.type)) {
                $(element).css("background-color", "#444");
                DEBUG && console.log("Pressed", element.id); // Debug
            }
            else {
                $(element).css("background-color", "transparent");
                DEBUG && console.log("Released", element.id); // Debug
            }
        }
    }
}

function analogSwitch(event) {
    event.preventDefault();
    if (event.type == "touchstart") {
        $("#analogSwitch").css("border-style", "inset");
        return;
    }
    $("#analogSwitch").css("border-style", "outset");

    let d = $("#DPAD");
    let a = $("#ANALOG");
    if (a.css("display") == "none") {
        analog.active = true;
        a.show(); d.hide();
        analogReset(a);
        return;
    }
    analog.active = false;
    a.hide(); d.show();
}

function uploadROM(event) {
    event.preventDefault();
    if (event.type == "touchstart") {
        $("#loadROM").css("border-style", "inset");
        return;
    }
    $("#loadROM").css("border-style", "outset");
    if (SINGLE_ROM) return;

    pauseEmulation();
    $('#upload').trigger('click');

    const inputElement = document.getElementById("upload");
    inputElement.addEventListener("change", handleFiles, false);

    function handleFiles() {
        let f = document.getElementById('upload').files[0];
        var reader = new FileReader();
        reader.onload = function () {
            nes.loadROM(reader.result);
            resumeEmulation();
        }
        reader.readAsBinaryString(f);
    }
}

// Only works for Android devices
function toggleFullScreen(event) {
    event.preventDefault();
    let element = document.getElementById("main");
    if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
    ) {
        if (element.requestFullScreen) {
             element.requestFullScreen();
        } else if (element.webkitRequestFullScreen) {
             element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
             element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
             element.msRequestFullscreen();
        } else if (element.webkitEnterFullscreen) {
            element.webkitEnterFullscreen(); //for iphone this code worked
        }
      }
    else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
      }
}

function preventDefault(event) {
    event.preventDefault();
}

function assign(fn, elementName, ...touchEvents) {
    // Prevent default on all events
    let element = document.getElementById(elementName);
    for (const e of TOUCH_EVENTS.split(' ')) {
        eval("element.ontouch" + e + " = preventDefault");
    }
    // Assign function call to events
    for (const e of touchEvents) {
        eval("element.ontouch" + e + " = fn");
    }
}

function html(obj, id, text) {
    return `<${obj} id='${id}'>${text}</${obj}>`;
}

function pauseText() {
    let resumeMsg = isMobileDevice() ? "Tap" : "Click";
    resumeMsg += " to resume";
    return html("span", "pauseText", pauseMsg + "<br/>" + resumeMsg);
}

function pauseEmulation(content=null) {
    DEBUG && console.log("Emulation paused");
    emulationPaused = true;
    osd.empty();
    osd.append(content || pauseText());
    osd.show();
}

function resumeEmulation() {
    DEBUG && console.log("Emulation resumed");
    if (cannotResume) return;
    emulationPaused = false;
    osd.hide();
}

function handleLandscapeMode() {
    cannotResume = true;
    pauseEmulation(
        html(
            "span", "pauseText",
            "Landscape mode not supported<br/>Please turn your device upright to play"
        )
    );
}

function loadState(s) {
    nes.fromJSON(JSON.parse(s));
}

function saveState() {
    return JSON.stringify(nes.toJSON());
}

function setOSDLayout() {
    let rect = gameScreen[0].getBoundingClientRect();
    osd.css("top", rect.top);
    osd.css("left", rect.left);
    osd.css("height", gameScreen.height());
    osd.css("width", gameScreen.width());
}

// function setPageLayout() {
//     let w = window.innerWidth; // window.screen.availWidth;
//     let h = window.innerHeight; // window.screen.availHeight;
//
//     if (h >= w || window.matchMedia("(orientation: portrait)").matches) {
//         DEBUG && console.log("Show touch controls");
//
//         let opacity = 1;
//         let bottom = "auto";
//
//         $("#gameScreen").width("100%");
//         let newWidth = $("#gameScreen").width();
//         $("#gameScreen").height(240 * (newWidth / 256));
//
//         let padHeight = vw(47.5);
//         let remainingHeight = h - $("#gameScreen").height();
//         $("#ninjaPad").height(Math.max(padHeight, remainingHeight));
//
//         let difference = remainingHeight - padHeight;
//         if (difference < 0) {
//             opacity += (difference / (padHeight * 2));
//             bottom = 0;
//         }
//         $("#ninjaPad").css("bottom", bottom);
//         $("#ninjaPad").css("opacity", opacity);
//         $("#ninjaPad").css("display", "block");
//
//         $("#CONTROLLER").show();
//
//         if (cannotResume) {
//             cannotResume = false;
//             pauseEmulation();
//         }
//     }
//     else {
//         $("#gameScreen").height("100%");
//         let newHeight = $("#gameScreen").height();
//         $("#gameScreen").width(256 * (newHeight / 240));
//
//         $("#ninjaPad").height("0%");
//         $("#CONTROLLER").hide();
//
//         if (isMobileDevice()) {
//             handleLandscapeMode();
//             DEBUG && console.log("Mobile mode: Landscape");
//         }
//         else {
//             DEBUG && console.log("Desktop mode");
//         }
//     }
//     setOSDLayout();
// }

function setDesktopLayout() {
    gameScreen.height("100%");
    let newHeight = $("#gameScreen").height();
    gameScreen.width(256 * (newHeight / 240));
    ninjaPad.height("0%");
    controller.hide();
}

function setMobileLayout(height) {
    let opacity = 1;
    let bottom = "auto";

    gameScreen.width("100%");
    let newWidth = $("#gameScreen").width();
    gameScreen.height(240 * (newWidth / 256));

    let padHeight = vw(47.5);
    let remainingHeight = height - $("#gameScreen").height();
    ninjaPad.height(Math.max(padHeight, remainingHeight));

    let difference = remainingHeight - padHeight;
    if (difference < 0) {
        opacity += (difference / (padHeight * 2));
        bottom = 0;
    }
    ninjaPad.css("bottom", bottom);
    ninjaPad.css("opacity", opacity);
    ninjaPad.css("display", "block");

    controller.show();

    if (cannotResume) {
        cannotResume = false;
        pauseEmulation();
    }
}

function setPageLayout() {
    let w = window.innerWidth; // window.screen.availWidth;
    let h = window.innerHeight; // window.screen.availHeight;
    if (h >= w) {
        DEBUG && console.log("Show touch controls");
        setMobileLayout(h);
    }
    else {
        setDesktopLayout();
        if (isMobileDevice()) handleLandscapeMode();
        DEBUG && console.log("Hide touch controls");
    }
    setOSDLayout();
}

function loadNinjaPad(gameScreenId) {
    $("#ninjaPad").load(
        "ninjapad.html",
        function() {
            // Cache frequently used objects
            ninjaPad    = $("#ninjaPad");
            gameScreen  = $("#" + gameScreenId);
            controller  = $("#CONTROLLER");
            analogStick = $("#ANALOG_STICK");
            osd         = $("#OSD");

            // Page setup
            setPageLayout();

            // Assign function calls to touch events
            assign(toggleFullScreen, gameScreenId, "end");
            assign(uploadROM, "loadROM", "start", "end");
            assign(analogSwitch, "analogSwitch", "start", "end");
            assign(buttonPress, "CONTROLLER", "start", "move", "end");
            assign(analogTouch, "ANALOG_STICK", "start", "move", "end");
            assign(preventDefault, "ninjaPad");
            assign(resumeEmulation, "OSD", "end");
        }
    );
}