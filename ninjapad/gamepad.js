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

function isButtonDown(eventType) {
    return eventType.endsWith("start") || eventType.endsWith("move");
}

function fnButtonPress(eventType) {
    return isButtonDown(eventType) ? emulator.buttonDown : emulator.buttonUp;
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
    for (const b of buttons) fn(b);
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
                jQElement.analogStick.css(
                    "transform",
                    "translate(" + dx + "px, " + dy + "px)"
                );
                let btnIndex = Math.floor(((180 + (45/2) + (r * 180 / Math.PI)) % 360) / 45);
                analog.padBtn && pressButtons(emulator.buttonUp, analog.padBtn);
                analog.padBtn = d < vw(DEADZONE) ? null : DPAD_BUTTONS[btnIndex];
                analog.padBtn && pressButtons(emulator.buttonDown, analog.padBtn);
                break;

            default:
                analog.padBtn && pressButtons(emulator.buttonUp, analog.padBtn);
                analogReset(jQElement.analogStick);
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
                emulator.buttonUp(lastButton.id);
                $(lastButton).css("border-style", "outset");
                DEBUG && console.log("Released", lastButton.id); // Debug
            }
            // Otherwise, if it was a multipress
            else if (lastButton.id.startsWith("MULTI")) {
                // Get buttons
                let key = lastButton.id.split("_").pop();
                for (const d of MULTIPRESS[key]) {
                    emulator.buttonUp(d);
                }
                $(lastButton).css("background-color", "transparent");
                DEBUG && console.log("Released", lastButton.id); // Debug
            }
            // Update the child button to be the one the user is touching right now
            childButton[target.id] = element;
        }

        // If the user is actually interacting a button right now
        if (element.id.startsWith("BUTTON")) {

            // Press / release that button
            fnButtonPress(event.type)(element.id);

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
            let fn = fnButtonPress(event.type)

            // Get buttons and press / release them
            let key = element.id.split("_").pop();
            for (const d of MULTIPRESS[key]) {
                fn(d);
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
        jQElement.analogSwitch.css("border-style", "inset");
        return;
    }
    jQElement.analogSwitch.css("border-style", "outset");

    if (jQElement.analog.css("display") == "none") {
        analog.active = true;
        jQElement.dpad.hide();
        jQElement.analog.show();
        analogReset(jQElement.analog);
        return;
    }
    analog.active = false;
    jQElement.analog.hide();
    jQElement.dpad.show();
}

function menu(event) {
    event.preventDefault();
    if (event.type == "touchstart") {
        jQElement.menu.css("border-style", "inset");
        return;
    }
    jQElement.menu.css("border-style", "outset");
    toggleMenu();
}

// Doesn't work on iOS
function toggleFullScreen(event) {
    event.preventDefault();
    let element = document.getElementById("main");
    isFullScreen() ? exitFullScreen() : enterFullscreen(element);
}
