const interface = {
    jsnes: function() {
        const BUTTON_A = 0;
        const BUTTON_B = 2;

        const SCREEN_WIDTH = 256;
        const SCREEN_HEIGHT = 240;
        const FRAMEBUFFER_SIZE = SCREEN_WIDTH*SCREEN_HEIGHT;

        const AUDIO_BUFFERING = 512;
        const SAMPLE_COUNT = 4*1024;
        const SAMPLE_MASK = SAMPLE_COUNT - 1;

        var canvas_ctx, image;
        var framebuffer_u8, framebuffer_u32;

        var audio_ctx, script_processor;
        var audio_samples_L = new Float32Array(SAMPLE_COUNT);
        var audio_samples_R = new Float32Array(SAMPLE_COUNT);
        var audio_write_cursor = 0, audio_read_cursor = 0;

        const nes = new jsnes.NES({
            onFrame: function(framebuffer_24){
                for(var i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
            },
            onAudioSample: function(l, r){
                audio_samples_L[audio_write_cursor] = l;
                audio_samples_R[audio_write_cursor] = r;
                audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
            },
            // sampleRate: getSampleRate()
        });

        function getSampleRate()
        {
            if (!window.AudioContext) {
                return 44100;
            }
            let myCtx = new window.AudioContext();
            let sampleRate = myCtx.sampleRate;
            myCtx.close();
            return sampleRate;
        }

        function onAnimationFrame(){
            window.setTimeout(onAnimationFrame, 1000/60);
            image.data.set(framebuffer_u8);
            canvas_ctx.putImageData(image, 0, 0);
            nes.frame();
        }

        function audio_remain(){
            return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK;
        }

        function audio_callback(event) {
            if (nes.rom == null) return;

            var dst = event.outputBuffer;
            var len = dst.length;

            // Attempt to avoid buffer underruns.
            if(audio_remain() < AUDIO_BUFFERING) nes.frame();

            var dst_l = dst.getChannelData(0);
            var dst_r = dst.getChannelData(1);
            for(var i = 0; i < len; i++){
                var src_idx = (audio_read_cursor + i) & SAMPLE_MASK;
                dst_l[i] = audio_samples_L[src_idx];
                dst_r[i] = audio_samples_R[src_idx];
            }

            audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK;
        }

        function keyboard(callback, event) {
            var player = 1;
            var prevent = true;
            switch(event.keyCode){
                case 38: // UP
                case 87: // W
                    callback(player, jsnes.Controller.BUTTON_UP); break;
                case 40: // Down
                case 83: // S
                    callback(player, jsnes.Controller.BUTTON_DOWN); break;
                case 37: // Left
                case 65: // A
                    callback(player, jsnes.Controller.BUTTON_LEFT); break;
                case 39: // Right
                case 68: // D
                    callback(player, jsnes.Controller.BUTTON_RIGHT); break;
                case 18: // 'alt'
                case 88: // 'x'
                    callback(player, jsnes.Controller.BUTTON_A); break;
                case 90: // 'z'
                case 17: // 'ctrl'
                    callback(player, jsnes.Controller.BUTTON_B); break;
                case 32: // Space
                case 16: // Right Shift
                    callback(player, jsnes.Controller.BUTTON_SELECT); break;
                case 13: // Return
                    callback(player, jsnes.Controller.BUTTON_START); break;
                default:
                    prevent = false; break;
            }

            if (prevent){
                event.preventDefault();
            }
        }

        function nes_init(canvas_id){
            var canvas = document.getElementById(canvas_id);
            canvas_ctx = canvas.getContext("2d");
            image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

            canvas_ctx.fillStyle = "black";
            canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

            // Allocate framebuffer array.
            var buffer = new ArrayBuffer(image.data.length);
            framebuffer_u8 = new Uint8ClampedArray(buffer);
            framebuffer_u32 = new Uint32Array(buffer);

            // Setup audio.
            audio_ctx = new window.AudioContext();
            script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
            script_processor.onaudioprocess = audio_callback;
            script_processor.connect(audio_ctx.destination);
            document.addEventListener('touchstart',  () => { audio_ctx.resume() });
        }

        function nes_boot(rom_data){
            nes.loadROM(rom_data);
            window.requestAnimationFrame(onAnimationFrame);
        }

        function nes_load_data(canvas_id, rom_data){
            nes_init(canvas_id);
            nes_boot(rom_data);
        }

        function nes_load_url(canvas_id, path){
            nes_init(canvas_id);

            var req = new XMLHttpRequest();
            req.open("GET", path);
            req.overrideMimeType("text/plain; charset=x-user-defined");
            req.onerror = () => console.log(`Error loading ${path}: ${req.statusText}`);

            req.onload = function() {
                if (this.status === 200) {
                nes_boot(this.responseText);
                } else if (this.status === 0) {
                    // Aborted, so ignore error
                } else {
                    req.onerror();
                }
            };

            req.send();
        }

        document.addEventListener('keydown', (event) => {keyboard(nes.buttonDown, event)});
        document.addEventListener('keyup', (event) => {keyboard(nes.buttonUp, event)});

        return {
            core: function() { 
                return nes;
            }(),

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
        };
    }()
}
