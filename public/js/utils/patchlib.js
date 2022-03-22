"use strict"
const PatchLoader = {
    /**
     * 
     * @param {*} filepath 
     */
    async getPatch(filepath) {

        return $.get(filepath);
    },

    async patchFileLoader(filePath, prop) {
        let soundObj = {};

        return await this.getPatch(filePath).then((patchStr)=>{
            window[filePath] = window[filePath] || Pd.loadPatch(patchStr);
            soundObj.patch =  window[filePath];
            //soundObj.patch =  Pd.loadPatch(patchStr);
            soundObj.play = (time, setStart, setDuration) => {
                Pd.send(prop, ['bang!']);
            };

            return soundObj;
        });
    },

    /**
     * Load several patches at once
     * @param {*} object 
     */
     async patchBatchLoader(object){
       
        for (let prop in object) {
            object[prop] = await this.patchFileLoader(object[prop], prop);
        }

        return object;
    },

    
}

export {PatchLoader as default}
