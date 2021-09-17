function setOSDLayout() {
    let rect = gameScreen[0].getBoundingClientRect();
    osd.empty();
    osd.css("top", rect.top);
    osd.css("left", rect.left);
    osd.css("height", gameScreen.height());
    osd.css("width", gameScreen.width());
    osd.css("visibility", pauseScreen.visibility);
    osd.append(pauseScreen.content);
}

function setDesktopLayout() {
    gameScreen.height("100%");
    let newHeight = gameScreen.height();
    gameScreen.width(256 * (newHeight / 240));
    ninjaPad.height("0%");
    controller.hide();
}

function setMobileLayout(height) {
    let opacity = 1;
    let bottom = "auto";

    gameScreen.width("100%");
    let newWidth = gameScreen.width();
    gameScreen.height(240 * (newWidth / 256));

    let padHeight = vw(47.5);
    let remainingHeight = height - gameScreen.height();
    ninjaPad.height(Math.max(padHeight, remainingHeight));

    let difference = remainingHeight - padHeight;
    if (difference < 0) {
        opacity += (difference / (padHeight * 2));
        bottom = 0;
    }
    ninjaPad.css("bottom", bottom);
    ninjaPad.css("display", "block");

    controller.css("opacity", opacity);
    controller.show();

    if (cannotResume) {
        cannotResume = false;
        pauseEmulation();
    }
}

function setPageLayout() {
    let w = $(window).width(); //window.innerWidth; // window.screen.availWidth;
    let h = $(window).height(); //window.innerHeight; // window.screen.availHeight;
    if (h >= w || window.matchMedia("(orientation: portrait)").matches) {
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

function handleLandscapeMode() {
    cannotResume = true;
    pauseEmulation(
        html(
            "span", "pauseScreenContent",
            `Landscape mode not supported at the moment<br/>
            Please turn your device upright to play`
        )
    );
}
