const INTERFACE = {
    jsnes: {
        buttonDown: function() {
            nes.buttonDown(1, eval("jsnes.Controller." + b));
        },

        buttonUp: function() {
            nes.buttonUp(1, eval("jsnes.Controller." + b));
        },

        pause: function() {
            audio_ctx.suspend();
            audio_ctx = {resume: function(){}};
            nes.break = true;
        },

        resume: function() {
            audio_ctx = new window.AudioContext();
            script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
            script_processor.onaudioprocess = audio_callback;
            script_processor.connect(audio_ctx.destination);
            audio_ctx.resume();
            nes.break = false;
        }


        // ...
    }
}
