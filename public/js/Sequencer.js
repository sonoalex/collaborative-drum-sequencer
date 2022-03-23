import PatchLoader from "./utils/patchlib";
import Metronome from "./metronome";
import GridRenderer from "./ui/gridRenderer";

const Sequencer = {
    options: {
        TEMPO: 125,
        BAR_LENGTH: 16,
        sixteenth: 4,
        minuteSeconds: 60,
        freqOne: 500,
        freqTwo: 300
    },
    audioContext: null,
    futureTickTime: null,
    counter: 1,
    oscillator: null,
    metronomeVolume: null,
    samples: null,
    gridPositions: {
        kickTrack: [],
        snareTrack: [],
        hatTrack: [],
        shakerTrack: []
    },
    timerId: undefined,
    isPlaying: false,
    socket: io(),
    socketId: new Date().getTime(),

    loadSamples() {
        return new Promise((myResolve, myReject) => {
            // "Producing Code" (May take some time)

            PatchLoader.patchBatchLoader({
                kick: "patches/kick.pd",
                snare: "patches/snare.pd",
                hat: "patches/hat.pd",
                shaker: "patches/shaker.pd",
            }).then(patches => {
                console.log(patches);
                this.samples = patches;
                myResolve();
            }).catch(e => {
                myReject();  // when error
            });     
        });
        
    },
    init() {
    
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        this.secondsPerBeat = this.options.minuteSeconds / this.options.TEMPO;
        this.counterTimeValue = this.secondsPerBeat / this.options.sixteenth; //16th note (4/4 ) => Each beat has 4 subdivisions

        this.constructGrid();

        //PatchLoader.getPatch('patches/kick_3.pd');
       
       
    },

    start() {
        this.futureTickTime = this.audioContext.currentTime;

        this.metronome = new Metronome(new GainNode(this.audioContext));
        this.metronome
            .getGain()
            .setValueAtTime(0, this.audioContext.currentTime);

        this.loadEvents();
        this.loadSocketEvents();
        
        this.play();
        this.socket.emit('isPlaying', this.isPlaying);
    },

    constructGrid() {
        GridRenderer.render(this.gridPositions, this.options.BAR_LENGTH);
    },

    sequenceGridToggler(domEleClass, arr) {
        let gridItemElements = document.querySelectorAll(domEleClass + '>.grid-item');
        
        for (let item of gridItemElements) {
            item.addEventListener("click", e =>
                this.handleGridClick(e, gridItemElements, arr)
            );
        }
    },
    handleGridClick(e, elements, arr) {
        
        function findIndexInClass(collection, node) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i] === node) return i + 1;
            }
            return -1;
        }

        let target = e.target;
        let offsetIndex = findIndexInClass(elements, target);
        let positionIndex = arr.indexOf(offsetIndex);
        if (positionIndex > -1) {
            arr.splice(positionIndex, 1);
            target.style.background = "";
        } else {
            arr.push(offsetIndex);
            target.style.background = "purple";
        }
        this.socket.emit('grid-changed', this.gridPositions);
    },

    loadSocketEvents() {

        this.socket.on('grid-changed', (data) => {
            console.log(data);
            this.gridPositions = data.message;
            this.constructGrid();
            this.loadEvents();
          });

        this.socket.on('isPlaying', data => {
            console.log(data);
            //this.init();
        });

        /*this.socket.on('new user', data => {
            console.log('new user connected');
            this.gridPositions = data.message;
            this.constructGrid();
            this.loadEvents();
        }); */
        this.socket.on('room full', data => {
            console.log('full!');
            this.play();
            alert('Room is full');
        }); 


        this.socket.on('tempo changed', data => {
            this.options.TEMPO = data.message;
            const tempoElement = document.getElementById("showTempo")
            const slider = document.getElementById("tempo");
            slider.value  = data.message;
            tempoElement.innerHTML = data.message;
        });
    },

    loadEvents() {
        this.sequenceGridToggler(
            ".track-1-container",
            this.gridPositions.kickTrack
        );
        this.sequenceGridToggler(
            ".track-2-container",
            this.gridPositions.snareTrack
        );
        this.sequenceGridToggler(
            ".track-3-container",
            this.gridPositions.hatTrack
        );
        this.sequenceGridToggler(
            ".track-4-container",
            this.gridPositions.shakerTrack
        );
        
        
    },

    setMetronomeGainValue(e) {
        this.metronome
            .getGain()
            .setValueAtTime(e.value, this.audioContext.currentTime);
    },

    playMetronome(time) {
        this.metronome.setOscillator(this.audioContext.createOscillator());
        this.metronome.getVolume().connect(this.audioContext.destination);

        if (this.counter === 1 || (this.counter - 1) % 4 === 0) {
            if (this.counter === 1) {
                this.metronome
                    .getOscillator()
                    .frequency.setValueAtTime(
                        this.options.freqOne,
                        this.audioContext.currentTime
                    );
            } else {
                this.metronome
                    .getOscillator()
                    .frequency.setValueAtTime(
                        this.options.freqTwo,
                        this.audioContext.currentTime
                    );
            }

            this.metronome.start(time);
            this.metronome.stop(time);
        }
    },

    play() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.counter = 1;
            this.futureTickTime = this.audioContext.currentTime;
            this.scheduler();
        } else {
            window.clearTimeout(this.timerId);
        }
    },

    playTick(tempo) {
        //console.log("This is 16th beat : " + this.counter);
        this.options.TEMPO = tempo;
        this.secondsPerBeat = this.options.minuteSeconds / this.options.TEMPO;
        this.counterTimeValue = this.secondsPerBeat / this.options.sixteenth; //16th note (4/4 ) => Each beat has 4 subdivisions
        this.displayTimer();
        this.playMetronome(this.futureTickTime);
        this.counter += 1;

        if (this.counter > this.options.BAR_LENGTH) {
            this.counter = 1;
        }
    },

    displayTimer() {
        
        let count;
        let timerElements = document.querySelectorAll('.timer');
        
        [].forEach.call(timerElements, (item)=>{item.classList.remove("timer")});

        if (this.counter === 1) {
            return;
        } else if (this.counter === 16) {
            count = this.counter;
        } else {
            count = this.counter - 1;
        }

        let stepElements = document.getElementsByClassName(`step-${count}`);
        [].forEach.call(stepElements, item => {
            item.classList.add("timer");
        });
    },

    scheduler() {
        if (this.futureTickTime < this.audioContext.currentTime + 0.1) {
            this.futureTickTime += this.counterTimeValue;
            //console.log(this.futureTickTime);
            this.scheduleSound(
                this.gridPositions.kickTrack,
                this.samples.kick,
                this.counter,
                this.futureTickTime - this.audioContext.currentTime
            );
            this.scheduleSound(
                this.gridPositions.snareTrack,
                this.samples.snare,
                this.counter,
                this.futureTickTime - this.audioContext.currentTime
            );
            this.scheduleSound(
                this.gridPositions.hatTrack,
                this.samples.hat,
                this.counter,
                this.futureTickTime - this.audioContext.currentTime
            );
            this.scheduleSound(
                this.gridPositions.shakerTrack,
                this.samples.shaker,
                this.counter,
                this.futureTickTime - this.audioContext.currentTime
            );
            this.playTick(this.options.TEMPO);
        }
        this.timerId = window.setTimeout(this.scheduler.bind(this), 0);
    },

    scheduleSound(trackArray, sound, count, time) {
        for (let i = 0; i < trackArray.length; i++) {
            if (count === trackArray[i]) {
                sound.play(time);
            }
        }
    }
};

export { Sequencer as default };
