// IPTV Player
const video = document.getElementById('videoPlayer');
let allChannels = [];
const myLinks = {1:"http://185.226.172.11:8080/mo3ad/mo3ad1.m3u8",2:"http://185.226.172.11:8080/mo3ad/mo3ad2.m3u8",3:"http://185.226.172.11:8080/mo3ad/mo3ad3.m3u8",4:"http://185.226.172.11:8080/mo3ad/mo3ad4.m3u8"};

function playLink(id){startStream(myLinks[id],`قناة ${id}`);}
async function fetchM3U(url){
    if(!url) return;
    const res = await fetch(url);
    const data = await res.text();
    parseM3U(data);
}
function parseM3U(content){
    allChannels=[];
    const lines=content.split('\n');
    let current={};
    lines.forEach(line=>{
        line=line.trim();
        if(line.startsWith('#EXTINF:')){
            const name=line.split(',')[1];
            const logo=line.match(/tvg-logo="([^"]+)"/)?.[1]||'https://via.placeholder.com/50?text=TV';
            current={name,logo};
        }else if(line.startsWith('http')){current.url=line;allChannels.push(current);current={};}
    });
    displayChannels(allChannels);
}
function displayChannels(channels){
    const list=document.getElementById('channelsList');
    list.innerHTML=channels.map(ch=>`<div class="channel-item" onclick="startStream('${ch.url}','${ch.name}')"><img src="${ch.logo}"><div class="channel-name">${ch.name}</div></div>`).join('');
}
function filterChannels(){
    const q=document.getElementById('searchBar').value.toLowerCase();
    displayChannels(allChannels.filter(ch=>ch.name.toLowerCase().includes(q)));
}
function startStream(url,title){
    document.getElementById('playingTitle').innerText=title;
    document.getElementById('playingUrl').innerText=url;
    if(Hls.isSupported()){const hls=new Hls();hls.loadSource(url);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,()=>video.play());} 
    else if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url;video.play();}
}

// Chat
const socket = io();
let username = '';
while(!username){username=prompt('ادخل اسم مستعار للدردشة:');}
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
socket.emit('join', username);
socket.on('message', data=>{
    const div=document.createElement('div');
    div.innerHTML=`<b>${data.user}:</b> ${data.msg}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop=chatMessages.scrollHeight;
});
function sendMessage(e){
    if(e.key==='Enter'&&chatInput.value.trim()!==''){
        socket.emit('message',{user:username,msg:chatInput.value});
        chatInput.value='';
    }
}
