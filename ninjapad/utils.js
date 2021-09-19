const TOUCH_EVENTS = ["start", "move", "end"];

function preventDefault(event) {
    event.preventDefault();
}

function stopPropagation(event) {
    event.stopPropagation();
}

function isIOSDevice(){
   return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isFullScreen() {
    return (
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement
    );
}

function enterFullscreen(element) {
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

function exitFullScreen() {
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

function html(obj, id, text) {
    return `<${obj} id='${id}'>${text}</${obj}>`;
}

function link(content, js, hide) {
    js = `${js}; return false;`;
    return hide || `<a href="#" onclick="${js}">${content}</a>`;
}

function createMenu(title, ...opts) {
    opts = opts.filter(e => e !== true);
    title = title ? `${title}<br/>` : "";
    return (
        `<div style="line-height: 2.2em;">
            ${title}
            ${opts.join("<br/>")}
        </div>`
    );
}

function assign(fn, elementName, ...touchEvents) {
    // Prevent default on all events
    let element = document.getElementById(elementName);
    for (const e of TOUCH_EVENTS) {
        eval("element.ontouch" + e + " = preventDefault");
    }
    // Assign function call to events
    for (const e of touchEvents) {
        eval("element.ontouch" + e + " = fn");
    }
}

function allowInteraction(elementName) {
    let element = document.getElementById(elementName);
    for (const e of TOUCH_EVENTS) {
        eval("element.ontouch" + e + " = stopPropagation");
    }
}

function compress(data) {
    const buf = fflate.strToU8(data);
    return fflate.compressSync(buf, { level: 9, mem: 8 });
}

function decompress(data) {
    const decompressed = fflate.decompressSync(data);
    return fflate.strFromU8(decompressed);
}
