import React, { Component } from 'react';

export default class EditSongModal extends Component {
    handleEdtiSong = (event) => {
        event.stopPropagation();
        let song = {};
        song.title = document.getElementById("edit_title").value;
        song.artist = document.getElementById("edit_artist").value;
        song.youTubeId = document.getElementById("edit_youtube_id").value;
        this.props.edtiSongCallback(song);
    }
    render() {
        const { index, currentList, hideEditSongModalCallback } = this.props;
        let song = {};
        if(currentList && currentList.songs.length > 0 && index >= 0) {
            song = currentList.songs[index];
        }

        return (
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-edit-song-root'>
                        <div class="modal-north">
                            Edit Song
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                                <div class="modal-center-content-title">
                                    <label class="modal-center-content-lable">Title:</label>
                                    <input type="text" class="modal-center-content-input" id="edit_title" defaultValue={song.title}/>
                                </div>
                                <div class="modal-center-content-artist">
                                    <label class="modal-center-content-lable">Artist:</label>
                                    <input type="text" class="modal-center-content-input" id="edit_artist" defaultValue={song.artist}/>
                                </div>
                                <div class="modal-center-content-youtubeid">
                                    <label class="modal-center-content-lable">You Tube Id:</label>
                                    <input type="text" class="modal-center-content-input" id="edit_youtube_id" defaultValue={song.youTubeId}/>
                                </div>
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                class="modal-button" 
                                onClick={this.handleEdtiSong}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}