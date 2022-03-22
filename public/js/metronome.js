class Metronome {
    constructor(gainNode) {
        this.gainNode = gainNode;
        console.log("Hello from Metronome....");
    }

    getOscillator() {
        return this.oscillator;
    }

    setOscillator(oscillator) {
        this.oscillator = oscillator;
        this.prepareOscillator();
    }

    getVolume() {
        return this.gainNode;
    }

    getGain() {
        return this.gainNode.gain;
    }

    prepareOscillator() {
        this.oscillator.type = "square";
        this.oscillator.connect(this.gainNode);
    }
    start(time) {
        this.oscillator.start(time);
    }

    stop(time) {
        this.oscillator.stop(time + 0.1);
    }
}

export { Metronome as default };
