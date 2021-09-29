const layout = function() {
    function setOSDLayout() {
        jQElement.osd.empty();
        jQElement.osd.detach().appendTo(jQElement.screen);
        jQElement.osd.css("top", 0);
        jQElement.osd.css("left", 0);
        jQElement.osd.css("height", jQElement.screen.height());
        jQElement.osd.css("width", jQElement.screen.width());
        jQElement.osd.css("visibility", pauseScreen.visibility);
        jQElement.osd.append(pauseScreen.content);
    }

    function setDesktopLayout() {
        DEBUG && console.log("Desktop mode");

        let useJQuery = !isFullScreen() || isIOSDevice();
        let width = useJQuery ? $(window).width() : window.innerWidth;
        let height = useJQuery ? $(window).height() : window.innerHeight;

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
        jQElement.gamepad.height("0%");
        jQElement.controller.hide();
    }

    function setMobileLayout() {
        DEBUG && console.log("Mobile mode");
        jQElement.screen.detach().appendTo("#SCREEN");
        $("body *").not("#ninjaPad *").not("#ninjaPad").remove();

        let useJQuery = !isFullScreen() || isIOSDevice();
        let width = useJQuery ? $(window).width() : window.innerWidth;
        let height = useJQuery ? $(window).height() : window.innerHeight;

        if (height >= width || window.matchMedia("(orientation: portrait)").matches) {
            let opacity = 1;
            let bottom = "auto";

            jQElement.screen.width("100%");
            let newWidth = jQElement.screen.width();
            jQElement.screen.height(240 * (newWidth / 256));

            let padHeight = vw(47.5);
            let remainingHeight = height - jQElement.screen.height();
            jQElement.gamepad.height(Math.max(padHeight, remainingHeight));

            let difference = remainingHeight - padHeight;
            if (difference < 0) {
                opacity += (difference / (padHeight * 2));
                bottom = 0;
            }
            jQElement.gamepad.css("bottom", bottom);
            jQElement.gamepad.css("display", "block");

            jQElement.controller.css("opacity", opacity);
            jQElement.controller.show();

            if (cannotResume) {
                cannotResume = false;
                pauseEmulation();
            }
            DEBUG && console.log("Show touch controls");
        }
        else {
            setDesktopLayout();
            handleLandscapeMode();
            DEBUG && console.log("Hide touch controls");
        }
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

    return {
        setPageLayout: function() {
            isMobileDevice() ? setMobileLayout() : setDesktopLayout();
            setOSDLayout();
        }
    };
}();
