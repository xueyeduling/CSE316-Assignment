import React, { Component } from 'react';

export default class EditSongModal extends Component {
    constructor(props) {
        super(props);

        this.stateSet = -1;

        this.state = {
            title: "",
            artist: "",
            youTubeId: ""
        }
    }
    handleHideEditSongModalCallback = (event) => {
        this.stateSet = -1;
        this.props.hideEditSongModalCallback();
    }
    handleTitle = (event) => {
        this.setState({ title: event.target.value, artist: this.state.artist, youTubeId: this.state.youTubeId });
    }
    handleArtist = (event) => {
        this.setState({ title: this.state.title, artist: event.target.value, youTubeId: this.state.youTubeId });
    }
    handleYouTubeId = (event) => {
        this.setState({ title: this.state.title, artist: this.state.artist, youTubeId: event.target.value });
    }
    handleEdtiSong = (event) => {
        event.stopPropagation();
        let song = {};
        song.title = this.state.title;
        song.artist = this.state.artist;
        song.youTubeId = this.state.youTubeId;
        this.props.edtiSongCallback(song);
    }
    render() {
        const { index, currentList } = this.props;
        let song = {};
        if(currentList && currentList.songs.length > 0 && index >= 0) {
            song = currentList.songs[index];
        }

        if(this.stateSet !== index) {
            this.setState({
                title: song.title,
                artist: song.artist,
                youTubeId: song.youTubeId
            });
            this.stateSet = index;
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
                                    <input type="text" class="modal-center-content-input" id="edit_title" onChange={this.handleTitle} value={this.state.title}/>
                                </div>
                                <div class="modal-center-content-artist">
                                    <label class="modal-center-content-lable">Artist:</label>
                                    <input type="text" class="modal-center-content-input" id="edit_artist" onChange={this.handleArtist} value={this.state.artist}/>
                                </div>
                                <div class="modal-center-content-youtubeid">
                                    <label class="modal-center-content-lable">You Tube Id:</label>
                                    <input type="text" class="modal-center-content-input" id="edit_youtube_id" onChange={this.handleYouTubeId} value={this.state.youTubeId}/>
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
                                onClick={this.handleHideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}