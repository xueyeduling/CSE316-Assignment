import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * AddSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author Wei He
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp) {
        super();
        this.app = initApp;
        let song = {};
        song.title = "Untitled";
        song.artist = "Unknown";
        song.youTubeId = "dQw4w9WgXcQ";
        this.song = song;
    }

    doTransaction() {
        this.app.addSong(this.song);
    }
    
    undoTransaction() {
        this.app.popSong();
    }
}