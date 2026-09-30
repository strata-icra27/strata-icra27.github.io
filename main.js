const conditions={
 slippery:{name:'slippery surface',response:'The box slides away.',adaptation:'Press on top to prevent sliding.'},
 hinge:{name:'stiff hinge',response:'The base lifts with the lid.',adaptation:'Press near the hinge while lifting.'}
};
const one=document.querySelector('#attempt-one'),two=document.querySelector('#attempt-two');
const play=document.querySelector('#play-trial'),status=document.querySelector('#trial-status');
let sequence=false,token=0;
function activeAttempt(n){
 document.querySelector('#first-attempt').classList.toggle('active',n===1);
 document.querySelector('#second-attempt').classList.toggle('active',n===2);
}
function stop(){sequence=false;token++;one.pause();two.pause();activeAttempt(0);play.firstChild.textContent='Play trial ';}
const caseSelect=document.querySelector('#trial-case');
caseSelect.addEventListener('change',()=>{
 const key=caseSelect.value,c=conditions[key];if(!c)return;
 stop();status.textContent='';
 [one,two].forEach((v,i)=>{v.poster=`assets/${key}-${i+1}.jpg`;v.querySelector('source').src=`assets/${key}-${i+1}.mp4`;v.setAttribute('aria-label',`Attempt ${i+1}, ${c.name}`);v.load();});
 document.querySelector('#response').textContent=c.response;document.querySelector('#adaptation').textContent=c.adaptation;
});
play.addEventListener('click',async()=>{
 if(sequence){stop();status.textContent='Paused';return;}
 stop();const current=token;sequence=true;one.currentTime=0;two.currentTime=0;play.firstChild.textContent='Pause trial ';
 try{await one.play();if(current!==token)return;activeAttempt(1);status.textContent='Attempt 1';}
 catch{if(current===token){stop();status.textContent='Playback unavailable.';}}
});
one.addEventListener('ended',async()=>{
 if(!sequence)return;const current=token;
 try{await two.play();if(current!==token)return;activeAttempt(2);status.textContent='Attempt 2 — selected from interaction history';}
 catch{if(current===token){stop();status.textContent='Playback unavailable.';}}
});
two.addEventListener('ended',()=>{stop();status.textContent='Trial complete';play.firstChild.textContent='Replay trial ';});
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{
 if(video!==one&&video!==two){stop();status.textContent='';}
 document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});
}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();document.querySelectorAll('video').forEach(v=>v.pause());}});
