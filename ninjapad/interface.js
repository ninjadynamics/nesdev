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
            if (!nes.rom.header) return;
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

        loadROMData: function(d) {
            nes.loadROM(d);
        },

        reloadROM: function() {
            nes.reloadROM();
        },

        getROMData: function() {
            return nes.romData;
        },

        saveState: function() {
            const o = nes.toJSON();
            const s = JSON.stringify(o);
            return zip(s);
        },

        loadState: function(z) {
            const s = unzip(z);
            const o = JSON.parse(s);
            nes.fromJSON(o);
        },

        isROMLoaded: function() {
            return !!nes.rom.header
        },

        initialize: function(filename) {
            nes_load_url(DISPLAY, ROMS_DIRECTORY + "/" + filename);
        }

        // ...
    }
}
