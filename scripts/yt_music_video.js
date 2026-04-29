function blockVideo() {
    document.querySelector("#main-panel").remove()
    document.querySelector("#side-panel").style.width = "100%"
    document.querySelector(".ytmusic-player-page").style.justifyContent = "center"
}



blockVideo()
setInterval(() => {
    blockVideo();    
}, 30000);