import React, { Component } from 'react';

export default class RemoveSongModal extends Component {
    
    handleRemoveSong = (event) => {
        event.stopPropagation();
        this.props.removeSongCallback(this.props.index);
    }
    render() {
        const { index, currentList, hideRemoveSongModalCallback } = this.props;
        let song = {};
        if(currentList && currentList.songs.length > 0 && index >= 0) {
            song = currentList.songs[index];
        }

        return (
            <div class="modal" id="remove-song-modal" data-animation="slideInOutLeft">
                <div class="modal-root" id='verify-remove-song-root'>
                    <div class="modal-north">
                        Remove song?
                    </div>
                    <div class="modal-center">
                        <div class="modal-center-content">
                            Are you sure you wish to permanently remove <span id="remove-song-span">{song.title}</span> from the playlist?
                        </div>
                    </div>
                    <div class="modal-south">
                        <input type="button" id="remove-song-confirm-button" class="modal-button" onClick={this.handleRemoveSong} value='Confirm' />
                        <input type="button" id="remove-song-cancel-button" class="modal-button" onClick={hideRemoveSongModalCallback} value='Cancel' />
                    </div>
                </div>
            </div>
        );
    }
}