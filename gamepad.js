// Handle single-touch multiple button presses
const MULTIPRESS = {
    "UR": ["BUTTON_UP",   "BUTTON_RIGHT"],
    "DR": ["BUTTON_DOWN", "BUTTON_RIGHT"],
    "UL": ["BUTTON_UP",   "BUTTON_LEFT" ],
    "DL": ["BUTTON_DOWN", "BUTTON_LEFT" ],
    "AB": ["BUTTON_A",    "BUTTON_B"    ]
};

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

function analogReset(element) {
    element.css("transform", "translate(0, 0)");
}

function analogTouch(event, touch) {
    let a = $("#ANALOG_STICK");
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
            a.css(
                "transform",
                "translate(" + dx + "px, " + dy + "px)"
            );
            analog.padBtn = d < vw(2) ?
                -1 : Math.floor((180 + (r * 180 / Math.PI)) / 45);
            console.log(analog.padBtn);
            break;

        default:
            analogReset(a);

    }
}

function buttonPress(event) {
	// Prevent all the shenanigans that happen with a "long-press" on mobile
	event.preventDefault();

	// Get the source element
	const src = event.srcElement;

	// Handle the touch
	for (const touch of event.changedTouches) {
		// Ignore any touches where the target
		// element doesn't match the source element
		if (touch.target.id != src.id) continue;
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // Handle the analog stick
        if (src.id == "ANALOG_STICK") {
            analogTouch(event, touch);
            return;
        }

		// Get the element (either a button or the empty area of the gamepad)
		// the user is physically touching right now
		let element = $(document.elementFromPoint(touch.clientX, touch.clientY))[0];

		// If it's a new touch, set the child button to its parent
		if (event.type == "touchstart") {
			childButton[src.id] = element;
		}
		// Otherwise, if the user is sliding its finger from one button to another
		// or simply stops touching the screen with that finger
		else if (childButton[src.id].id != element.id) {
        //else if (element.id && childButton[src.id].id != element.id) {
			// Check which button (if any) the user had its finger on previously
			let lastButton = childButton[src.id];
			// If the user was actually pressing a button before
			if (lastButton.id.startsWith("BUTTON")) {
				// Tell the emulator to release that button
				nes.buttonUp(1, eval("jsnes.Controller." + lastButton.id));
                $(lastButton).css("border-style", "outset");
                console.log("Released", lastButton.id); // Debug
			}
            // Otherwise, if it was a multipress
            else if (lastButton.id.startsWith("MULTI")) {
                // Get buttons
                let key = lastButton.id.split("_").pop();
                for (const d of MULTIPRESS[key]) {
                    nes.buttonUp(1, eval("jsnes.Controller." + d));
                }
                $(lastButton).css("background-color", "transparent");
                console.log("Released", lastButton.id); // Debug
            }
			// Update the child button to be the one the user is touching right now
			childButton[src.id] = element;
		}

		// If the user is actually interacting a button right now
		if (element.id.startsWith("BUTTON")) {

            // Get the correct function call
			let fn = fnNesButtonPress(event.type)

            // Send that button interaction to the emulator
			fn(1, eval("jsnes.Controller." + element.id));

			// Show button presses / releases
			if (isButtonDown(event.type)) {
                emulationPaused = false;
                $(element).css("border-style", "inset");
                console.log("Pressed", element.id); // Debug
			}
			else {
                $(element).css("border-style", "outset");
                console.log("Released", element.id);  // Debug
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

            // Show button presses / releases
            if (isButtonDown(event.type)) {
                emulationPaused = false;
				$(element).css("background-color", "#444");
                console.log("Pressed", element.id); // Debug
			}
			else {
				$(element).css("background-color", "transparent");
                console.log("Released", element.id); // Debug
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
    emulationPaused = true;
    if (event.type == "touchstart") {
        $("#loadROM").css("border-style", "inset");
        return;
    }
    $("#loadROM").css("border-style", "outset");
    $('#upload').trigger('click');

    const inputElement = document.getElementById("upload");
    inputElement.addEventListener("change", handleFiles, false);

    function handleFiles() {
        let f = document.getElementById('upload').files[0];
        var reader = new FileReader();
        reader.onload = function () {
            nes.loadROM(reader.result);
            emulationPaused = false;
        }
        reader.readAsBinaryString(f);
    }
}

// Only works for Android devices
function toggleFullScreen(event) {
    event.preventDefault();
	let element = document.querySelector("#all");
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
