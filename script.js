console.log("JavaScript code starts from here");

let currentSong = new Audio();
let songs;
let currFolder;
let isShuffleEnabled = false;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let response = await fetch(`https://divyanshuk09.github.io/Spotify-Clone/Songs/${folder}/`);
    let text = await response.text();
    let li = document.createElement("li");
    li.innerHTML = text;
    let as = li.getElementsByTagName("a");
    
    songs = [];
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    
    let songlist = document.querySelector(".songList ul");
    songlist.innerHTML = songs.map(song => 
        `<li><div class="info">
            <img src="left svg/music-icon.svg" alt="">
            <div class="songname">${song.replaceAll("%20", " ")}</div>
        </div></li>`).join("");
    
    Array.from(songlist.getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', () => {
            playMusic(e.querySelector(".info>div").innerText);
        });
    });
    
    return songs;
}

const playMusic = (track, pause = false) => {
    if (!track || !currFolder) {
        console.error("Track or folder is undefined!", track, currFolder);
        return;
    }
    let songUrl = `https://divyanshuk09.github.io/Spotify-Clone/Songs/${currFolder}/${track}`;
    console.log("Fetching song:", songUrl);
    
    currentSong.src = songUrl;
    if (!pause) {
        currentSong.play();
        play.src = "play bar/pause-round-icon.svg";
    }
    
    document.querySelector(".song-name").innerText = decodeURI(track);
    document.querySelector(".current-time").innerText = "00:00";
    document.querySelector(".duration").innerText = "00:00";
};

async function displayAlbums() {
    let response = await fetch("https://divyanshuk09.github.io/Spotify-Clone/Songs/");
    let text = await response.text();
    let li = document.createElement("li");
    li.innerHTML = text;
    let anchors = li.getElementsByTagName("a");
    
    let cardcontainer = document.querySelector(".cardcontainer");
    for (let e of anchors) {
        if (e.href.includes("/Songs/")) {
            let folder = e.href.split('/').slice(4)[0];
            let metadata = await fetch(`https://divyanshuk09.github.io/Spotify-Clone/Songs/${folder}/info.json`).then(res => res.json());
            
            cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play"><img src="right svg/Play_Button.svg" alt=""></div>
                    <img src="https://divyanshuk09.github.io/Spotify-Clone/Songs/${folder}/cover.jpeg" alt="">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>`;
        }
    }
    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            console.log("Fetching Songs");
            songs = await getsongs(`Songs/${e.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

currentSong.addEventListener('ended', () => {
    let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
    playMusic(songs[(index + 1) % songs.length]);
});

document.addEventListener('DOMContentLoaded', async () => {
    songs = await getsongs("Diljit-Dosanjh");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "play bar/pause-round-icon.svg";
        } else {
            currentSong.pause();
            play.src = "play bar/play-round-icon.svg";
        }
    });
    
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".current-time").innerText = secondsToMinutesSeconds(currentSong.currentTime);
        document.querySelector(".duration").innerText = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            e.target.src = "play bar/mute.svg";
            currentSong.volume = 0;
        } else {
            e.target.src = "play bar/volume.svg";
            currentSong.volume = 0.4;
        }
        document.querySelector(".volume-value").innerText = Math.round(currentSong.volume * 100) + "%";
    });
});
