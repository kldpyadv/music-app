console.log("Script is running")

let currentSong = new Audio();
let songSrc = '';
let preSongSrc = '';
let songs = [];
let lastVolume = 50;
let currFolder;
let imgSrcArray = [];
const volumeBar = document.getElementById('volume-bar');
const volumeIcon = document.getElementById('volume-icon');
const volumeRange = document.getElementById('volume-range');
const seekbar = document.getElementById('seekip');
let volumeLevel = volumeRange.value;
const jsmediatags = window.jsmediatags;
function convertSecondsToTime(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }
    //Extract hours, minutes, and remaining seconds
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    seconds = Math.floor(seconds);

    // Format the time
    let formattedTime = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

    if (hours > 0) {
        formattedTime = String(hours).padStart(2, '0') + ':' + formattedTime;
    }

    return formattedTime;
}

const playMusic =(track, pause=false) => {
    preSongSrc = currentSong.src;
    //console.log(preSongSrc);
    currentSong.src = `/${currFolder}/` + track;
    if(songSrc != currentSong.src){
        //console.log(1);
        if(!pause){
            seekbar.style.background = `#A7A7A7`;
            document.querySelector("#previous").style.color = "var(--colorwht)";
            currentSong.play();
            songSrc = currentSong.src;
            play.classList.remove("fa-circle-play");
            play.classList.add("fa-circle-pause");
        }
        document.querySelector(".songname").innerHTML = `<div class="playlcard flex p10 rounded10"><div class="playthumb"><i class="fa-solid fa-music mt5"></i></div><div class="playldet  ml20"><h3 title="${decodeURI(track)}">${decodeURI(track)}</h3><p class="mr5 mt5"><span>Sonu Nigam</span></p></div></div>`;
        document.querySelector(".inittime").innerHTML = "00:00";
        document.querySelector(".sttime").innerHTML = "00:00";
    }else{
        songSrc = ''
        play.classList.remove("fa-circle-pause");
        play.classList.add("fa-circle-play");
    }
    
}

function updateVolume() {
    if (volumeLevel == 0) {
      volumeIcon.innerHTML = '<i class="fa-solid fa-volume-off blkcolor"></i>';
    } else if (volumeLevel < 50) {
      volumeIcon.innerHTML = '<i class="fa-solid fa-volume-low blkcolor"></i>';
    } else {
      volumeIcon.innerHTML = '<i class="fa-solid fa-volume-high blkcolor"></i>';
    }
    volumeRange.style.background = `linear-gradient(to right, #242424 ${(volumeLevel )}%, #A7A7A7 ${volumeLevel }%)`;
    currentSong.volume = parseInt(volumeLevel)/100;
}




async function getAudioData(sname){
        let adata = [];
        return new Promise((resolve, reject) => {
            jsmediatags.read(`http://127.0.0.1:3000/${currFolder}/` + sname, {
                onSuccess: (tag) => {
                  resolve(tag.tags);
                },
                onError: (error) => {
                  reject(error);
                }
            });
          });
    
}




async function getSongs(folder){
    currFolder = folder;
    let status = 0;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    //console.log(`http://127.0.0.1:3000/${folder}/`);
    let div  = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    //console.log(as);
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songL = document.querySelector(".userlib").getElementsByClassName("libsongs")[0];
    for (let index = 0; index < songs.length; index++) {
        const song = songs[index];
        //console.log(song);
        const tags = await getAudioData(song);
        var image = tags.picture;
        if (image) {
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            var base64 = "data:" + image.format + ";base64," +
            window.btoa(base64String);
            var imgsrc = base64;
            imgSrcArray.push(imgsrc);
            songL.innerHTML = songL.innerHTML + `<li data-index="${index}" class="playlcard pointer bg-dgrey flex p10 mt10 rounded10"><div class="playthumb"><img src="${imgsrc}" /></i></div><div class="playldet ml20"><h3 title="${tags.title}"> ${tags.title} </h3><p class="mr5 mt5"><span>${tags.artist} </span></p></div></li>`;
            status = 1;
        } else {
            songL.innerHTML = songL.innerHTML + `<li  data-index="${index}" class="playlcard pointer bg-dgrey flex p10 mt10 rounded10"><div class="playthumb"><i class="fa-solid fa-music"></i></div><div class="playldet ml10"><h3 title="${song.replaceAll("%20"," ".replaceAll(".mp3",""))}"> ${song.replaceAll("%20"," ")} </h3><p class="mr5 mt5"><span>Sonu Nigam </span></p></div></li>`;
            status =1;
        }
    }

    Array.from(document.querySelector(".libsongs").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            //console.log(1);
            console.log(element.currentTarget.dataset);
            playMusic(songs[element.currentTarget.dataset.index]);
        })
        
    });
    // Event listner to play every song
    songInterval = setInterval(function () {
        //console.log(status);
        if(status==1){
            
            //console.log(Array.from(document.querySelector(".libsongs").getElementsByTagName("li")).length);
            if(Array.from(document.querySelector(".libsongs").getElementsByTagName("li")).length == songs.length){
                clearInterval(songInterval);
            }
            
        }
    }, 1000);
    
    

    playMusic(songs[0], true);
}

async function main(){

    await getSongs("songs");
                                               
    // Event listner for next/previous

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.classList.remove("fa-circle-play");
            play.classList.add("fa-circle-pause");
        }else{
            currentSong.pause();
            play.classList.remove("fa-circle-pause");
            play.classList.add("fa-circle-play");
        }
    })

    //time update event listner
    currentSong.addEventListener("timeupdate", () =>{
        //console.log(convertSecondsToTime(currentSong.currentTime), convertSecondsToTime(currentSong.duration));
        document.querySelector(".inittime").innerHTML = `${convertSecondsToTime(currentSong.currentTime)}`;
        document.querySelector(".sttime").innerHTML = `${convertSecondsToTime(currentSong.duration)}`;
        seekbar.max = currentSong.duration;
        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        seekbar.style.background = `linear-gradient(to right, #242424 ${(percent)}%, #A7A7A7 ${percent}%)`;
        //document.querySelector(".circle").style.left = percent + "%";
        //console.log("linear-gradient(90deg, #FFC0CB "+percent+"%, #00FFFF "+(100 - percent)+"%)");
        //document.querySelector(".seekbar").style.background = "linear-gradient(90deg, #121212 "+(percent+.5)+"%, #A7A7A7 0)";
        
        seekbar.value = currentSong.currentTime;
        //console.log(seekbar.value)
        if(currentSong.currentTime == currentSong.duration){
            play.classList.remove("fa-circle-pause");
            play.classList.add("fa-circle-play");
            document.querySelector(".inittime").innerHTML = "00:00";
            //seekbar.style.background = `#A7A7A7`;
            //document.querySelector(".circle").style.left =  "0%";
            //document.querySelector(".seekbar").style.background = "#A7A7A7";
            //CurrentSong.currentTime = "00:00";
            //seekbar.value = 0;
        }
})


    // seekbar eventlistner
    seekbar.addEventListener('input', function () {
        //console.log(document.querySelector(".sttime").innerHTML);
        let sttime = document.querySelector(".sttime").innerHTML;
        if(sttime != "00:00"){
            currentSong.currentTime = seekbar.value;
        }
        
    })

    //hamburger eventlistner
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".leftsec").style.left = "0px";
    })

    document.querySelector(".hamclose").addEventListener("click", ()=>{
        document.querySelector(".leftsec").style.left = "-295px";
    })

    // next button event listner
    next.addEventListener("click", () => {
        console.log(currentSong.src);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index+1) < songs.length){
            playMusic(songs[index+1]);
            //console.log(index,songs.length);
            if((index+2) == songs.length){
                //console.log(1);
                document.querySelector("#next").style.color = "var(--colorgrey)";
            }
        }
    })

    // previous button event listner
    previous.addEventListener("click", () => {
        if(preSongSrc != ''){
            //console.log(preSongSrc);
            let index = songs.indexOf(preSongSrc.split("/").slice(-1)[0]);
            playMusic(songs[index]);
        }
        
    })
    // Volume range input event listener

    // Set initial volume
    updateVolume();

    volumeRange.addEventListener('input', function() {
        volumeLevel = this.value;
        updateVolume();
    });

    volumeIcon.addEventListener('click', function() {
        if(volumeRange.value != 0){
            lastVolume = volumeRange.value;
            volumeLevel = 0;
            volumeRange.value = 0;
            updateVolume();
        }else{
            volumeLevel = lastVolume;
            volumeRange.value = lastVolume;
            updateVolume();
        }
        
    });


    
}

main()