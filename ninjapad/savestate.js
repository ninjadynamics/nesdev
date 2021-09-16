function loadState(s) {
    nes.fromJSON(JSON.parse(s));
}

function saveState() {
    return JSON.stringify(nes.toJSON());
}
