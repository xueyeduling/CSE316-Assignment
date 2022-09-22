import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * AddSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author Wei He
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initIndex) {
        super();
        this.app = initApp;
        this.index = initIndex;
        this.song = initApp.state.currentList.songs[initIndex];
    }

    doTransaction() {
        this.app.removeSongByIndex(this.index);
    }
    
    undoTransaction() {
        this.app.addSongByIndex(this.index, this.song);
    }
}