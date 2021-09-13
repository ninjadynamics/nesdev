const DEBUG = false;
const SINGLE_ROM = false;
const DEADZONE = 2; //vw

function isIOSDevice(){
   return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

function setPageLayout() {
    let h = window.screen.availHeight
    let w = window.screen.availWidth
    if (h >= w) {
        DEBUG && console.log("Show touch controls");
        let opacity = 1;
        let bottom = "auto";

        $("#gameScreen").width("100%");
        let newWidth = $("#gameScreen").width();
        $("#gameScreen").height(240 * (newWidth / 256));

        let padHeight = vw(47.5);
        let remainingHeight = h - $("#gameScreen").height();
        $("#ninjaPad").height(Math.max(padHeight, remainingHeight));

        let difference = remainingHeight - padHeight;
        if (difference < 0) {
            opacity += (difference / (padHeight * 2));
            bottom = 0;
        }

        $("#ninjaPad").css("bottom", bottom);
        $("#ninjaPad").css("opacity", opacity);
        $("#ninjaPad").show();
        DEBUG && console.log("Mobile mode");
    }
    else {
        $("#gameScreen").height("100%");
        let newHeight = $("#gameScreen").height();
        $("#gameScreen").width(256 * (newHeight / 240));
        $("#ninjaPad").hide();
        DEBUG && console.log("Desktop mode");
    }
}

$(window).resize(function() {
    setPageLayout();
});

$(document).ready(function() {
    setPageLayout();
    loadNinjaPad("gameScreen");
    nes_load_url("nes-canvas", "main.nes");
});
