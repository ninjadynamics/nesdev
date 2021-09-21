function setOSDLayout() {
    let rect = jQElement.screen[0].getBoundingClientRect();
    jQElement.osd.empty();
    jQElement.osd.css("top", rect.top);
    jQElement.osd.css("left", rect.left);
    jQElement.osd.css("height", jQElement.screen.height());
    jQElement.osd.css("width", jQElement.screen.width());
    jQElement.osd.css("visibility", pauseScreen.visibility);
    jQElement.osd.append(pauseScreen.content);
}

function setDesktopLayout(width, height) {
    DEBUG && console.log("Desktop mode");
    if (width > height) {
        jQElement.screen.height("100%");
        let newHeight = jQElement.screen.height();
        jQElement.screen.width(256 * (newHeight / 240));
    }
    else {
        jQElement.screen.width("100%");
        let newWidth = jQElement.screen.width();
        jQElement.screen.height(240 * (newWidth / 256));
    }
    jQElement.ninjaPad.height("0%");
    jQElement.controller.hide();
}

function setMobileLayout(width, height) {
    DEBUG && console.log("Mobile mode");
    if (height >= width || window.matchMedia("(orientation: portrait)").matches) {
        let opacity = 1;
        let bottom = "auto";

        jQElement.screen.width("100%");
        let newWidth = jQElement.screen.width();
        jQElement.screen.height(240 * (newWidth / 256));

        let padHeight = vw(47.5);
        let remainingHeight = height - jQElement.screen.height();
        jQElement.ninjaPad.height(Math.max(padHeight, remainingHeight));

        let difference = remainingHeight - padHeight;
        if (difference < 0) {
            opacity += (difference / (padHeight * 2));
            bottom = 0;
        }
        jQElement.ninjaPad.css("bottom", bottom);
        jQElement.ninjaPad.css("display", "block");

        jQElement.controller.css("opacity", opacity);
        jQElement.controller.show();

        if (cannotResume) {
            cannotResume = false;
            pauseEmulation();
        }
        DEBUG && console.log("Show touch controls");
    }
    else {
        setDesktopLayout(width, height);
        handleLandscapeMode();
        DEBUG && console.log("Hide touch controls");
    }
}

function setPageLayout() {
    let useJQuery = !isFullScreen() || isIOSDevice();
    let w = useJQuery ? $(window).width() : window.innerWidth; // window.screen.availWidth;
    let h = useJQuery ? $(window).height() : window.innerHeight; // window.screen.availHeight;
    isMobileDevice() ? setMobileLayout(w, h) : setDesktopLayout(w, h);
    setOSDLayout();
}

function handleLandscapeMode() {
    cannotResume = true;
    pauseEmulation(
        html(
            "span", "pauseScreenContent",
            `Landscape mode<br/>
            not supported yet<br/>
            <br/>
            Turn your device<br/>
            upright to play`
        )
    );
}
