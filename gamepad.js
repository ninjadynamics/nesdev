// This object is necessary to handle the user
// sliding their finger from one button to another
var childButton = {};

const diagonals = {
    "UR": ["BUTTON_UP",   "BUTTON_RIGHT"],
    "DR": ["BUTTON_DOWN", "BUTTON_RIGHT"],
    "UL": ["BUTTON_UP",   "BUTTON_LEFT" ],
    "DL": ["BUTTON_DOWN", "BUTTON_LEFT" ]
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

function buttonPress(event) {
	// Prevent all the shenanigans that happen with a "long-press" on mobile
	event.preventDefault();
    event.stopPropagation();

	// Get the source element and event type
	const src = event.srcElement;
	const eventType = event.type;

	// Handle the touch
	for (const touch of event.changedTouches) {
		// Ignore any touches where the target
		// element doesn't match the source element
		if (touch.target.id != src.id) continue;
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// Get the element (either a button or the empty area of the gamepad)
		// the user is physically touching right now
		let element = $(document.elementFromPoint(touch.clientX, touch.clientY))[0];

		// If it's a new touch, set the child button to its parent
		if (eventType == "touchstart") {
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
            else if (lastButton.id.startsWith("DIAG")) {
                // Get buttons of diagonal
                let key = lastButton.id.split("_").pop();
                for (const d of diagonals[key]) {
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
			let fn = fnNesButtonPress(eventType)

            // Send that button interaction to the emulator
			fn(1, eval("jsnes.Controller." + element.id));

			// Show button presses / releases for the
			// current button the user is interacting with
			if (isButtonDown(eventType)) {
                $(element).css("border-style", "inset");
                console.log("Pressed", element.id); // Debug
			}
			else {
                $(element).css("border-style", "outset");
                console.log("Released", element.id);  // Debug
			}
		}
        // Otherwise, if it's a diagonal on the dpad
        else if (element.id.startsWith("DIAG")) {

            // Get the correct function call
            let fn = fnNesButtonPress(eventType)

            // Get buttons of diagonal
            let key = element.id.split("_").pop();
            for (const d of diagonals[key]) {
                fn(1, eval("jsnes.Controller." + d));
            }

            // Show button presses / releases for the
			// current diagonal the user is interacting with
            if (isButtonDown(eventType)) {
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

// Only works for Android devices
function toggleFullScreen(event) {
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
