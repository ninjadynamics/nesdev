const DEBUG = true;
const SINGLE_ROM = false;
const DEADZONE = 2; //vw

function isIOSDevice(){
   return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
//         $("#ninjaPad").show();
//     }
//     else {
//         $("#gameScreen").height("100%");
//         let newHeight = $("#gameScreen").height();
//         $("#gameScreen").width(256 * (newHeight / 240));
//
//         pauseEmulation();
//
//         // $("#ninjaPad").css("opacity", "1");
//         //if (isMobileDevice()) {
//         //    pauseEmulation();
//         //    DEBUG && console.log("Mobile mode: Landscape");
//         //}
//         //else {
//         //    DEBUG && console.log("Desktop mode");
//         //}
//     }
//
//     //loadNinjaPad("gameScreen");
//
//     if (isMobileDevice()) {
//         window.onblur=function(event){
//             pauseEmulation();
//         }
//     }
// }

// Pause on loss of focus
window.onblur=function(event){
    isMobileDevice() && pauseEmulation();
}

// Reload layout on orientation change
$(window).resize(function() {
    loadNinjaPad("gameScreen");
});

$(document).ready(function() {
    //setPageLayout();
    loadNinjaPad("gameScreen");
    nes_load_url("nes-canvas", "main.nes");
});