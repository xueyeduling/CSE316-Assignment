import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import EditSong_Transaction from  './transactions/EditSong_Transaction.js';
import AddSong_Transaction from  './transactions/AddSong_Transaction.js';
import RemoveSong_Transaction from  './transactions/RemoveSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import EditSongModal from './components/EditSongModal';
import RemoveSongModal from './components/RemoveSongModal';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {c
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        //
        this.deleteListModal = false;
        this.editSongModal = false;
        this.removeSongModal = false;

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            songIndexMarkedForEdition : -1,
            songIndexMarkedForRemove: -1,
            currentList : null,
            sessionData : loadedSessionData
        }
        // ctrl + z and ctrl + y available
        document.onkeydown = (event) => {
            if(event.ctrlKey) {
                if(event.key === 'z' || event.key === 'Z') {
                    this.undo();
                }
                else if(event.key === 'y' || event.key === 'Y') {
                    this.redo();
                }
            }
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            songIndexMarkedForEdition : -1,
            songIndexMarkedForRemove: -1,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);

            this.updateToolbarButtons();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);

            this.updateToolbarButtons();
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            songIndexMarkedForEdition : -1,
            songIndexMarkedForRemove: -1,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.updateToolbarButtons();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            songIndexMarkedForEdition : -1,
            songIndexMarkedForRemove: -1,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.updateToolbarButtons();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            songIndexMarkedForEdition : -1,
            songIndexMarkedForRemove: -1,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        if(start === end){
            return;
        }
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
        this.updateToolbarButtons();
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
        this.updateToolbarButtons();
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.deleteListModal = true;
        this.updateToolbarButtons();
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () =>  {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.deleteListModal = false;
        this.updateToolbarButtons();
    }
    
    markSongForEdition = (index) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songIndexMarkedForEdition : index,
            songIndexMarkedForRemove: -1,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showEditSongModal();
        });
    }
    // TO SEE IF THEY REALLY WANT TO EDIT THE SONG
    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        this.editSongModal = true;
        this.updateToolbarButtons();
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideEditSongModal = () =>  {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.editSongModal = false;
        this.updateToolbarButtons();
    }
    // THIS FUNCTION ADDS A EditSong_Transaction TO THE TRANSACTION STACK
    addEdtiMarkedSongTransaction = (Song) => {
        let transaction = new EditSong_Transaction(this, Song);
        this.tps.addTransaction(transaction);
        this.hideEditSongModal();
    }
    // THIS FUNCTION BEGINS THE PROCESS OF EDITING A SONG.
    editSong(index, song) {
        let list = this.state.currentList;
        // List Saving
        list.songs[index] = song;
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A AddSong_Transaction TO THE TRANSACTION STACK
    addAddSongTransaction = () => {
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
        this.hideEditSongModal();
    }
    // THIS FUNCTION BEGINS THE PROCESS OF ADDING A SONG.
    addSong(song) {
        let list = this.state.currentList;
        list.songs.push(song);
        this.setStateWithUpdatedList(list);
    }
    //  THIS FUNCTION BEGINS THE PROCESS OF POPING A SONG.
    popSong() {
        let list = this.state.currentList;
        list.songs.pop();
        this.setStateWithUpdatedList(list);
    }

    markSongForRemove = (index) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songIndexMarkedForEdition : prevState.songIndexMarkedForEdition,
            songIndexMarkedForRemove: index,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showRemoveSongModal();
        });
    }
    // TO SEE IF THEY REALLY WANT TO REMOVE THE SONG
    showRemoveSongModal() {
        let modal = document.getElementById("remove-song-modal");
        modal.classList.add("is-visible");
        this.removeSongModal = true;
        this.updateToolbarButtons();
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideRemoveSongModal = () => {
        let modal = document.getElementById("remove-song-modal");
        modal.classList.remove("is-visible");
        this.removeSongModal =false;
        this.updateToolbarButtons();
    }
    // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
    addRemoveSongTransaction = (index) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songIndexMarkedForEdition : prevState.songIndexMarkedForEdition,
            songIndexMarkedForRemove: -1,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData
        }));
        let transaction = new RemoveSong_Transaction(this, index);
        this.tps.addTransaction(transaction);
        this.hideRemoveSongModal();
    }
    // THIS FUNCTION BEGINS THE PROCESS OF REMOVING A SONG.
    removeSongByIndex(index) {
        let list = this.state.currentList;
        list.songs.splice(index, 1);
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF ADDING A SONG BY INDEX.
    addSongByIndex(index, song) {
        let list = this.state.currentList;
        list.songs.splice(index, 0, song);
        this.setStateWithUpdatedList(list);
    }
    /*
        disableButton

        This function disables the button that has the id parameter
        as it's id property. This should be done as part of a foolproof
        design strategy.
    */
    disableButton(id) {
        let button = document.getElementById(id);
        button.classList.add("disabled");
        button.disabled = true;
    }
    /*
        enableButton

        This function enables the button that has the id parameter
        as it's id property. This should be done as part of a foolproof
        design strategy.
    */    
    enableButton(id) {
        let button = document.getElementById(id);
        button.classList.remove("disabled");
        button.disabled = false;
    }
    // 
    updateToolbarButtons() {
        if(this.deleteListModal || this.editSongModal || this.removeSongModal) {
            this.disableButton("add-list-button");
            this.disableButton("add-song-button");
            this.disableButton("undo-button");
            this.disableButton("redo-button");
            this.disableButton("close-button");
        }
        else{
            if(this.state.currentList !== null) this.disableButton("add-list-button");
            else {
                this.enableButton("add-list-button");
                this.disableButton("add-song-button");
                this.disableButton("undo-button");
                this.disableButton("redo-button");
                this.disableButton("close-button");
                return;
            }

            this.enableButton("add-song-button");
            this.enableButton("close-button");

            if(this.tps.hasTransactionToUndo()) this.enableButton("undo-button");
            else this.disableButton("undo-button");

            if(this.tps.hasTransactionToRedo()) this.enableButton("redo-button");
            else this.disableButton("redo-button");;
        }
    }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addSongCallback={this.addAddSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    editSongCallback={this.markSongForEdition}
                    removeSongCallback={this.markSongForRemove}/>
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    index={this.state.songIndexMarkedForEdition}
                    currentList={this.state.currentList}
                    hideEditSongModalCallback={this.hideEditSongModal}
                    edtiSongCallback={this.addEdtiMarkedSongTransaction}
                />
                <RemoveSongModal
                    index={this.state.songIndexMarkedForRemove}
                    currentList={this.state.currentList}
                    hideRemoveSongModalCallback={this.hideRemoveSongModal}
                    removeSongCallback={this.addRemoveSongTransaction}
                />
            </div>
        );
    }
}

export default App;
