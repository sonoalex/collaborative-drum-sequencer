const GridRenderer = {

    grid: document.getElementById('app-grid'),

    render(gridPositions, BAR_LENGTH) {

        this.grid.innerHTML ='';
        this.gridPositions= gridPositions;

        let i = 1;

        for (let el in this.gridPositions) {
            let div = document.createElement('div');
            div.classList.add(`track-${i}-container`);
            this.grid.appendChild(div);
            for (let j = 1; j <= BAR_LENGTH; j++) {
                let track = this.grid.getElementsByClassName(`track-${i}-container`).item(0);
                let item = document.createElement('div');

                if (j==1) item.classList+='timer ';
                
                if ((j - 1)%4 == 0) {
                    item.classList+=`grid-item track-step-double step-${j}`;
                } else {
                    item.classList+=`grid-item track-step step-${j}`;
                }
                
                track.appendChild(item);  
                this.drawPatterns(item, i, j);
            }
            i++;
        }
    },
    drawPatterns(item, i, j){
        console.log('drawing...');
        Object.entries(this.gridPositions)[i - 1].forEach(el => {
            if (Array.isArray(el)) {
                if (el.indexOf(j) > -1) {
                    item.style.background = 'purple';
                } else {
                    item.style.background = '';
                }
            }
        });
    },

}

export {GridRenderer as default}