import AudioLoader from "./utils/audiolib";
import Sequencer from "./sequencer";

(function() {
    let DAW = {
        main: document.getElementById("clicker"),
        metronome: document.getElementById("metronome"),
        tempo: document.getElementById("tempo"),
        showTempo: document.getElementById("showTempo"),
        metronomeRange: document.getElementById("metronome_range"),
        muted: true,

        init() {
            this.loadEvents();
        },
        loadEvents() {
            this.main.addEventListener("click", () => {
                AudioLoader.init();
                Sequencer.init();
            });

            this.metronome.addEventListener("click", e => {
                
                if (!this.muted) {
                    Sequencer.setMetronomeGainValue({ value: 0 });
                    this.metronome.innerHTML = "[ON] METRONOME";
                } else {
                    Sequencer.setMetronomeGainValue({
                        value: parseFloat(this.metronomeRange.value)
                    });
                    this.metronome.innerHTML = "[OFF] METRONOME";
                }

                this.muted = !this.muted;
            });

            this.tempo.addEventListener("change", e => {
                let value = e.target.value;
                Sequencer.playTick(value);
                this.showTempo.innerHTML = value;
                Sequencer.socket.emit('tempo changed', value);
            });

            this.metronomeRange.addEventListener("change", e => {
                Sequencer.setMetronomeGainValue({
                    value: parseFloat(e.target.value)
                });
            });
        }
    };

    DAW.init();
})();
