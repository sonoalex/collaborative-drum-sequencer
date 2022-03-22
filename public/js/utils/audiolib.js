"use strict"
const AudioLoader = {

    audioContext: null,

    init: function () {
        this.audioContext = new AudioContext(); 
    },
    /**
     * 
     * @param {*} filepath 
     */
    async getFile(filepath) {
        const response = await fetch(filepath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await  this.audioContext.decodeAudioData(arrayBuffer);

        return audioBuffer;
    },
    
    /**
     * 
     * @param {*} filePath 
     */
    async audioFileLoader(filePath, callback) {
        let soundObj = {};
        let playSound = undefined;
        soundObj.filePath = filePath;

        soundObj.name = this.basename(filePath);

        return await this.getFile(filePath, callback).then((audioBuffer)=>{
            soundObj.soundToPlay = audioBuffer;
            soundObj.play = (time, setStart, setDuration) => {
                playSound = this.audioContext.createBufferSource();
                playSound.buffer = soundObj.soundToPlay;
                playSound.start( 
                    this.audioContext.currentTime + time || this.audioContext.currentTime,
                    setStart || 0,
                    setDuration || soundObj.soundToPlay.duration
                );
                
                if (typeof callback === "function") {
                    callback(playSound, this.audioContext);
                } else {
                    playSound.connect(this.audioContext.destination);
                }
            };
    
            soundObj.stop = (time) => {
                playSound.stop(this.audioContext.currentTime + time || this.audioContext.currentTime);
            };

            return soundObj;
        });
    },

    /**
     * Load several samples at once
     * @param {*} object 
     */
    async audioBatchLoader(object){
        let callback;
    
        for (let prop in object) {
            if (typeof object[prop] === 'function') {
                callback = object[prop];
                delete object[prop];
                
            }
        }

        for (let prop in object) {
            object[prop] = await this.audioFileLoader(object[prop], callback);
        }

        return object;
    },
    basename(path) {
        return path.split(/[\\/]/).pop().split('.')[0];
    }
}

export {AudioLoader as default}
