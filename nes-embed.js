var SCREEN_WIDTH = 256;
var SCREEN_HEIGHT = 240;
var FRAMEBUFFER_SIZE = SCREEN_WIDTH*SCREEN_HEIGHT;

var canvas_ctx, image;
var framebuffer_u8, framebuffer_u32;

var AUDIO_BUFFERING = 512;
var SAMPLE_COUNT = 4*1024;
var SAMPLE_MASK = SAMPLE_COUNT - 1;
var audio_samples_L = new Float32Array(SAMPLE_COUNT);
var audio_samples_R = new Float32Array(SAMPLE_COUNT);
var audio_write_cursor = 0, audio_read_cursor = 0;

const BUTTON_A = 0;
const BUTTON_B = 2;

var nes = new jsnes.NES({
	onFrame: function(framebuffer_24){
		for(var i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
	},
	onAudioSample: function(l, r){
		audio_samples_L[audio_write_cursor] = l;
		audio_samples_R[audio_write_cursor] = r;
		audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
	},
	// sampleRate: getSampleRate()
});

function getSampleRate()
{
	if (!window.AudioContext) {
		return 44100;
	}
	let myCtx = new window.AudioContext();
	let sampleRate = myCtx.sampleRate;
	myCtx.close();
	return sampleRate;
}

function onAnimationFrame(){
	window.setTimeout(onAnimationFrame, 1000/60);

	image.data.set(framebuffer_u8);
	canvas_ctx.putImageData(image, 0, 0);
	nes.frame();
}

function audio_remain(){
	return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK;
}

function audio_callback(event) {
	if (nes.rom == null) return;

	var dst = event.outputBuffer;
	var len = dst.length;

	// Attempt to avoid buffer underruns.
	if(audio_remain() < AUDIO_BUFFERING) nes.frame();

	var dst_l = dst.getChannelData(0);
	var dst_r = dst.getChannelData(1);
	for(var i = 0; i < len; i++){
		var src_idx = (audio_read_cursor + i) & SAMPLE_MASK;
		dst_l[i] = audio_samples_L[src_idx];
		dst_r[i] = audio_samples_R[src_idx];
	}

	audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK;
}

function keyboard(callback, event) {
	var player = 1;
	var prevent = true;
	switch(event.keyCode){
		case 38: // UP
		case 87: // W
			callback(player, jsnes.Controller.BUTTON_UP); break;
		case 40: // Down
		case 83: // S
			callback(player, jsnes.Controller.BUTTON_DOWN); break;
		case 37: // Left
		case 65: // A
			callback(player, jsnes.Controller.BUTTON_LEFT); break;
		case 39: // Right
		case 68: // D
			callback(player, jsnes.Controller.BUTTON_RIGHT); break;
		case 18: // 'alt'
		case 88: // 'x'
			callback(player, jsnes.Controller.BUTTON_A); break;
		case 90: // 'z'
		case 17: // 'ctrl'
			callback(player, jsnes.Controller.BUTTON_B); break;
		case 32: // Space
		case 16: // Right Shift
			callback(player, jsnes.Controller.BUTTON_SELECT); break;
		case 13: // Return
			callback(player, jsnes.Controller.BUTTON_START); break;
		default: prevent = false; break;
	}

	if (prevent){
		event.preventDefault();
	}
}

function nes_init(canvas_id){
	var canvas = document.getElementById(canvas_id);
	canvas_ctx = canvas.getContext("2d");
	image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	canvas_ctx.fillStyle = "black";
	canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	// Allocate framebuffer array.
	var buffer = new ArrayBuffer(image.data.length);
	framebuffer_u8 = new Uint8ClampedArray(buffer);
	framebuffer_u32 = new Uint32Array(buffer);

	// Setup audio.
	var audio_ctx = new window.AudioContext();
	var script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
	script_processor.onaudioprocess = audio_callback;
	script_processor.connect(audio_ctx.destination);
	document.addEventListener('click',  () => {audio_ctx.resume()})
}

function nes_boot(rom_data){
	nes.loadROM(rom_data);
	window.requestAnimationFrame(onAnimationFrame);
}

function nes_load_data(canvas_id, rom_data){
	nes_init(canvas_id);
	nes_boot(rom_data);
}

function nes_load_url(canvas_id, path){
	nes_init(canvas_id);

	var req = new XMLHttpRequest();
	req.open("GET", path);
	req.overrideMimeType("text/plain; charset=x-user-defined");
	req.onerror = () => console.log(`Error loading ${path}: ${req.statusText}`);

	req.onload = function() {
		if (this.status === 200) {
		nes_boot(this.responseText);
		} else if (this.status === 0) {
			// Aborted, so ignore error
		} else {
			req.onerror();
		}
	};

	req.send();
}

document.addEventListener('keydown', (event) => {keyboard(nes.buttonDown, event)});
document.addEventListener('keyup', (event) => {keyboard(nes.buttonUp, event)});


/////////////////////
// GAMEPAD SUPPORT
//
// Based on documentation here: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
/////////////////////

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

// Once the presses a button on one of the controllers, this will store
// the index of that controller so that only that controller is checked
// each frame. This is to avoid additional controllers triggering key_up
// events when they are just sitting there inactive.
var cur_controller_index = -1;

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  delete controllers[gamepad.index];
}

// Check all controllers to see if player has pressed any buttons.
// If they have, store that as the current controller.
function findController()
{
	var i = 0;
	var j;

	for (j in controllers)
	{
		var controller = controllers[j];

		for (i = 0; i < controller.buttons.length; i++)
		{
			var val = controller.buttons[i];
			var pressed = val == 1.0;
			if (typeof(val) == "object")
			{
				pressed = val.pressed;
				val = val.value;
			}

			if (pressed)
			{
				cur_controller_index = j;
			}
		}
	}
}

function updateStatus()
{
	if (!haveEvents)
	{
		scangamepads();
	}

	// If a controller has not yet been chosen, check for one now.
	if (cur_controller_index == -1)
	{
	  findController();
	}

	// Allow for case where controller was chosen this frame
	if (cur_controller_index != -1)
	{
		var i = 0;
		var j;

		var controller = controllers[cur_controller_index];

		for (i = 0; i < controller.buttons.length; i++)
		{
			var val = controller.buttons[i];
			var pressed = val == 1.0;
			if (typeof(val) == "object")
			{
				pressed = val.pressed;
				val = val.value;
			}

			var player = 1 //parseInt(j,10) + 1;

			if (pressed)
			{
				var callback = nes.buttonDown;
				switch(i)
				{
					case 12: // UP
					callback(player, jsnes.Controller.BUTTON_UP); break;
					case 13: // Down
					callback(player, jsnes.Controller.BUTTON_DOWN); break;
					case 14: // Left
					callback(player, jsnes.Controller.BUTTON_LEFT); break;
					case 15: // Right
					callback(player, jsnes.Controller.BUTTON_RIGHT); break;
					case BUTTON_A: // 'A'
					callback(player, jsnes.Controller.BUTTON_A); break;
					case BUTTON_B: // 'B'
					callback(player, jsnes.Controller.BUTTON_B); break;
					case 8: // Select
					callback(player, jsnes.Controller.BUTTON_SELECT); break;
					case 9: // Start
					callback(player, jsnes.Controller.BUTTON_START); break;
				}
			}
			else
			{
				var callback = nes.buttonUp;
				switch(i)
				{
					case 12: // UP
					callback(player, jsnes.Controller.BUTTON_UP); break;
					case 13: // Down
					callback(player, jsnes.Controller.BUTTON_DOWN); break;
					case 14: // Left
					callback(player, jsnes.Controller.BUTTON_LEFT); break;
					case 15: // Right
					callback(player, jsnes.Controller.BUTTON_RIGHT); break;
					case BUTTON_A: // 'A'
					callback(player, jsnes.Controller.BUTTON_A); break;
					case BUTTON_B: // 'B'
					callback(player, jsnes.Controller.BUTTON_B); break;
					case 8: // Select
					callback(player, jsnes.Controller.BUTTON_SELECT); break;
					case 9: // Start
					callback(player, jsnes.Controller.BUTTON_START); break;
				}
			}

			// var axes = d.getElementsByClassName("axis");
			// for (i = 0; i < controller.axes.length; i++)
			// {
				// var a = axes[i];
				// a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
				// a.setAttribute("value", controller.axes[i] + 1);
			// }
		}
	}

	requestAnimationFrame(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
 setInterval(scangamepads, 500);
}

$(window).resize(function() {
	resize();
});

function resize() {
	let h = window.screen.availHeight
  	let w = window.screen.availWidth
  	if (h > w) {
		console.log("Show touch controls");
		$(".nes-div").width("100%");
		let newWidth = $(".nes-div").width();
		$(".nes-div").height(240 * (newWidth / 256));
		$(".controls").show();
		console.log("Mobile mode");
	}
	else {
		$(".nes-div").height("100%");
		let newHeight = $(".nes-div").height();
		$(".nes-div").width(256 * (newHeight / 240));
		$(".controls").hide();
		console.log("Desktop mode");
	}

	if (
		!document.fullscreenElement &&
		!document.mozFullScreenElement &&
		!document.webkitFullscreenElement
	) {
	  $("#toggleFullScreen").css("background-color", "green");
	}
	else {
	  $("#toggleFullScreen").css("background-color", "red");
	}

}

function isIOSDevice(){
   return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

$(document).ready(function() {
	resize();
	isIOSDevice() && $("#toggleFullScreen").hide();
	document.getElementById("toggleFullScreen").ontouchend = toggleFullScreen;
	document.getElementById("gamepad").ontouchstart = buttonPress;
	document.getElementById("gamepad").ontouchmove = buttonPress;
	document.getElementById("gamepad").ontouchend = buttonPress;
	nes_load_url("nes-canvas", "main.nes");
});

function isButtonDown(eventType) {
	return eventType.endsWith("start") || eventType.endsWith("move");
}

function fnNesButtonPress(eventType) {
	if (isButtonDown(eventType)) {
		return nes.buttonDown;
	}
	return nes.buttonUp;
}

// This object is necessary to handle the user
// sliding their finger from one button to another
var childButton = {};

function buttonPress(event) {
	// Prevent all the shenanigans that happen with a "long-press" on mobile
	event.preventDefault();

	// Used for debugging purposes
	let released = null;

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
			// Check which button (if any) the user had its finger on previously
			let lastButton = childButton[src.id];
			// If the user was actually pressing a button before
			if (lastButton.id.startsWith("BUTTON")) {
				// Tell the emulator to release that button
				nes.buttonUp(1, eval("jsnes.Controller." + lastButton.id));
				released = lastButton; // Faster debugging (?)
			}
			// Update the child button to be the one the user is touching right now
			childButton[src.id] = element;
		}

		// If the user is actually interacting a button right now
		if (element.id.startsWith("BUTTON")) {
			// Send that button interaction to the emulator
			let fn = fnNesButtonPress(eventType)
			fn(1, eval("jsnes.Controller." + element.id));

			// Show button presses / releases for the
			// current button the user is interacting with
			if (isButtonDown(eventType)) {
				//console.log("Pressed", element.id);
				$(element).css("background-color", "red");
			}
			else {
				//console.log("Released", element.id);
				$(element).css("background-color", "yellow");
			}
		}

		// Show button release for the last button
		// the user interacted with (if necessary)
		if (released) {
			//console.log("Released", released.id);
			$(released).css("background-color", "yellow");
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
