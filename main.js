const DEBUG = false;

function isIOSDevice(){
   return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

function resize() {
	let h = window.screen.availHeight
  	let w = window.screen.availWidth
  	if (h > w) {
		DEBUG && console.log("Show touch controls");
		$(".game").width("100%");
		let newWidth = $(".game").width();
		$(".game").height(240 * (newWidth / 256));
		$(".ninjapad").height(h - $(".game").height());
		$(".ninjapad").show();
		DEBUG && console.log("Mobile mode");
	}
	else {
		$(".game").height("100%");
		let newHeight = $(".game").height();
		$(".game").width(256 * (newHeight / 240));
		$(".ninjapad").hide();
		DEBUG && console.log("Desktop mode");
	}
}

$(window).resize(function() {
	resize();
});

$(document).ready(function() {
	resize();
	loadNinjaPad("gameScreen");
	nes_load_url("nes-canvas", "main.nes");
});
