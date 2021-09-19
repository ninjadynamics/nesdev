const INTERFACE = {
    jsnes: {
        buttonDown: function(b) {
            nes.buttonDown(1, eval("jsnes.Controller." + b));
        },

        buttonUp: function(b) {
            nes.buttonUp(1, eval("jsnes.Controller." + b));
        },

        pause: function() {
            function _pause() {
                if (nes.break) return;
                // - - - - - - - - - - - - - - - - - - - - - - -
                if (audio_ctx && audio_ctx.suspend) {
                    audio_ctx.suspend();
                }
                audio_ctx = {
                    resume: function(){},
                    isNull: true
                };
                nes.break = true;
                if (typeof enforcePause === 'undefined') {
                    enforcePause = setInterval(_pause, 16);
                }
            }
            _pause();
        },

        resume: function() {
            clearInterval(enforcePause);
            enforcePause = undefined;
            if (audio_ctx.isNull) {
                audio_ctx = new window.AudioContext();
                script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
                script_processor.onaudioprocess = audio_callback;
                script_processor.connect(audio_ctx.destination);
            }
            audio_ctx.resume();
            nes.break = false;
        },

        loadROM: function(f) {
            let reader = new FileReader();
            reader.onload = function () {
                nes.loadROM(reader.result);
                resumeEmulation();
            }
            reader.readAsBinaryString(f);
        },

        reloadROM: function() {
            nes.reloadROM();
        },

        getROMData: function() {
            return nes.romData;
        },

        saveState: function() {
            const obj = nes.toJSON();
            const str = JSON.stringify(obj);
            const zip = compress(str);
            return uint8ToUtf16.encode(zip);
        },

        loadState: function(s) {
            const zip = uint8ToUtf16.decode(s);
            const str = decompress(zip);
            const obj = JSON.parse(str);
            nes.fromJSON(obj);
        },

        initialize: function(filename) {
            nes_load_url(DISPLAY, ROMS_DIRECTORY + "/" + filename);
        }

        // ...
    }
}
