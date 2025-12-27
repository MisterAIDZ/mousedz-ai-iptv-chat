// IPTV Player
const video = document.getElementById('videoPlayer');
const hls = new Hls();
let allChannels = [];
const myLinks = {
    1: "http://185.226.172.11:8080/mo3ad/mo3ad1.m3u8",
    2: "http://185.226.172.11:8080/mo3ad/mo3ad2.m3u8",
    3: "http://185.226.172.11:8080/mo3ad/mo3ad3.m3u8",
    4: "http://185.226.172.11:8080/mo3ad/mo3ad4.m3u8"
};

function playLink(id){startStream(myLinks[id], "قناة " + id);}
async function fetchM3U(url){
    if(!url) return;
    document.getElementById('loader').style.display='block';
    const list=document.getElementById('channelsList'); list.innerHTML='';
    try{
        const resp=await fetch(url); const data=await resp.text();
        parseM3U(data);
    }catch(e){alert("خطأ في جلب القنوات (CORS).")}
    finally{document.getElementById('loader').style.display='none';}
}
function parseM3U(content){
    const lines=content.split('\n'); allChannels=[];
    let current={};
    lines.forEach(line=>{
        line=line.trim();
        if(line.startsWith('#EXTINF:')){
            const name=line.split(',')[1];
            const logo=line.match(/tvg-logo="([^"]+)"/)?.[1] || 'https://via.placeholder.com/50?text=TV';
            current={name,logo};
        } else if(line.startsWith('http')){current.url=line; allChannels.push(current); current={};}
    });
    displayChannels(allChannels);
}
function displayChannels(channels){
    const list=document.getElementById('channelsList');
    list.innerHTML=channels.map(ch=>`
        <div class="channel-item" onclick="startStream('${ch.url}','${ch.name}')">
            <img src="${ch.logo}" onerror="this.src='https://via.placeholder.com/50?text=TV'">
            <div>${ch.name}</div>
        </div>`).join('');
}
function filterChannels(){
    const q=document.getElementById('searchBar').value.toLowerCase();
    displayChannels(allChannels.filter(ch=>ch.name.toLowerCase().includes(q)));
}
function startStream(url,title){
    document.getElementById('playingTitle').innerText=title;
    document.getElementById('playingUrl').innerText=url;
    if(Hls.isSupported()){
        hls.stopLoad(); hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,()=>video.play().catch(()=>{}));
    } else if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url; video.play();}
    if(window.innerWidth<1024) window.scrollTo({top:0,behavior:'smooth'});
}

// Firebase Chat
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const nickname = "User" + Math.floor(Math.random()*1000);

db.ref('messages').on('child_added', snapshot=>{
    const msg=snapshot.val();
    const div=document.createElement('div'); div.textContent=`${msg.user}: ${msg.text}`;
    chatMessages.appendChild(div); chatMessages.scrollTop=chatMessages.scrollHeight;
});
function sendOnEnter(e){if(e.key==='Enter'){const text=chatInput.value.trim(); if(text){db.ref('messages').push({user:nickname,text}); chatInput.value='';}}}
