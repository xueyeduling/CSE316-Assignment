import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author Wei He
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initNewSong) {
        super();
        this.app = initApp;
        this.index = initApp.state.songIndexMarkedForEdition;
        this.oldSong = initApp.state.currentList.songs[this.index];
        this.newSong = initNewSong;
    }

    doTransaction() {
        this.app.editSong(this.index, this.newSong);
    }
    
    undoTransaction() {
        this.app.editSong(this.index, this.oldSong);
    }
}