console.log("javascript code starts from here");

let currentSong = new Audio();
let songs;
let currFolder;
let isShuffleEnabled = false;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    console.log(a)
    let response = await a.text();
    let li = document.createElement("li")
    li.innerHTML = response;
    let as = li.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    //show all songs in the playlist
    let songlist = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songlist.innerHTML = "";
    for (const song of songs) {
        songlist.innerHTML = songlist.innerHTML + `<li>
        <div class="info">
        <img src="left svg/music-icon.svg" alt="">
                             <div class="songname">${song.replaceAll("%20", " ")}
                             </div>
                             </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            console.log(e.querySelector(".info>div").innerHTML);
            playMusic(e.querySelector(".info>div").innerHTML);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "play bar/pause-round-icon.svg";
    }

    document.querySelector(".song-name").innerHTML = decodeURI(track);
    document.querySelector(".current-time").innerHTML = "00:00";
    document.querySelector(".duration").innerHTML = "00:00";
};

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let li = document.createElement("li")
    li.innerHTML = response;
    let anchors = li.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split('/').slice(4)[0]

            // get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
            <img src = "right svg/Play_Button.svg" alt="">
            </div>

            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })

}
// Autoplay next song when the current song ends
currentSong.addEventListener('ended', async () => {
    console.log('Song ended');
    let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);

    // Check if there's a next song
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    } else {
        // If there's no next song, you can choose to loop back to the first song
        // or stop playback.
        // For example, to loop back to the first song:
        playMusic(songs[0]);
    }
});


// MAIN FUNCTION........................

document.addEventListener('DOMContentLoaded', async () => {

    //get the list if all songs
    songs = await getsongs("songs/Diljit-Dosanjh");
    playMusic(songs[0], true);

    //display all the albums on the page 
    await displayAlbums()


    // Attach an event listener to play pause previous next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "play bar/pause-round-icon.svg";
        } else {
            currentSong.pause();
            play.src = "play bar/play-round-icon.svg";
        }
    });

    //listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".current-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Add an event listener for the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for the close icon in the left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Add an event listener for the previous button
    back.addEventListener("click", () => {
        currentSong.pause();
        console.log("Back button clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            console.log(currentSong);
        } else {
            currentSong.pause();
            play.src = "play bar/play-round-icon.svg";
            window.alert("Songs are not available behind this song.");
        }
    });

    // Add an event listener for the next button
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next button clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            console.log(currentSong);
        } else {
            currentSong.pause();
            play.src = "play bar/play-round-icon.svg";
            window.alert("Songs are not available ahead of this song.");
        }
    });


    // Add an event listener to the shuffle button
    const shuffleButton = document.querySelector(".shuffle");
    shuffleButton.addEventListener("click", () => {
        // Toggle the shuffle state
        isShuffleEnabled = !isShuffleEnabled;

        if (isShuffleEnabled) {
            // Shuffle the playlist
            songs = shuffleArray(songs);
        }

        // Play the first song based on shuffle state
        playMusic(isShuffleEnabled ? songs[0] : songs[0], true);

        // Update the shuffle button UI (you may have a different icon for enabled/disabled)
        shuffleButton.src = isShuffleEnabled ? "play bar/shuffle-enabled-icon.svg" : "play bar/shuffle-disabled-icon.svg";
    });

    // Function to shuffle an array (Fisher-Yates shuffle algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


 // Add event listener to mute/unmute the track
 document.querySelector(".volume>img").addEventListener("click", (e) => {
    // Toggle between mute and unmute
    if (currentSong.volume > 0) {
        // If volume is not zero, mute the track
        e.target.src = "play bar/volume.svg";
        currentSong.volume = 0;
    } else {
        // If volume is zero or muted, set volume to a default value (e.g., 0.2 or your preferred value)
        e.target.src = "play bar/mute.svg";
        currentSong.volume = 0.4;
    }

    // Update the volume value display
    document.querySelector(".volume-value").innerHTML = Math.round(currentSong.volume * 100) + "%";
});

// Add event listener to volume range
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
    // Update the volume based on the input value
    const volumeValue = parseInt(e.target.value);
    currentSong.volume = volumeValue / 100;

    // Update the volume button SVG
    updateVolumeButtonSVG();

    // Update the volume value display
    document.querySelector(".volume-value").innerHTML = volumeValue + "%";
});

// Function to update volume button SVG based on the current volume state
function updateVolumeButtonSVG() {
    const volumeButton = document.querySelector(".volume>img");

    if (currentSong.volume === 0) {
        volumeButton.src = "play bar/mute.svg";
    } else {
        volumeButton.src = "play bar/volume.svg";
    }
}

// Initial update of the volume button SVG on page load
updateVolumeButtonSVG();


    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .20;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }

    })

    // Set the volume range to be initially hidden
    document.querySelector(".range").style.display = "none";
    // Keep track of the volume range visibility
    let isVolumeRangeVisible = false;

    // Get the volume range element
    const volumeRange = document.querySelector(".range");

    // Toggle volume range visibility when clicking on volume-value
    document.querySelector(".volume-value").addEventListener("click", () => {
        // Toggle the visibility
        isVolumeRangeVisible = !isVolumeRangeVisible;

        // Set the display style based on the visibility status
        volumeRange.style.display = isVolumeRangeVisible ? "block" : "none";
    });


});
