import { icon } from './icons.js';
import { translateText } from './i18n.js';
let enabled=false,context,brushNoise;
try{enabled=localStorage.getItem('oceo-sound')==='1';}catch{}
export const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function revealView(element){
 if(!element || reducedMotion())return;
 element.animate([{opacity:0,translate:'0 6px'},{opacity:1,translate:'0 0'}],{duration:180,easing:'cubic-bezier(.2,.7,.2,1)'});
}
export function armSound(){
 if(!enabled)return;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context??=new Audio();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}
}
export function playEffect(kind='paper'){
 if(!enabled)return;armSound();if(!context || context.state!=='running')return;
 try{
  const now=context.currentTime;
  if(kind==='brush'){
   if(!brushNoise){brushNoise=context.createBuffer(1,Math.ceil(context.sampleRate*.085),context.sampleRate);const samples=brushNoise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1);}
   const noise=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
   noise.buffer=brushNoise;filter.type='lowpass';filter.frequency.value=1100;
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.025,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.08);
   noise.connect(filter);filter.connect(gain);gain.connect(context.destination);noise.start(now);noise.stop(now+.085);return;
  }
  const notes=kind==='stamp'?[{frequency:520,delay:0},{frequency:780,delay:.065}]:[{frequency:340,delay:0}];
  for(const note of notes){const tone=context.createOscillator(),gain=context.createGain();tone.type='sine';tone.frequency.setValueAtTime(note.frequency,now+note.delay);tone.frequency.exponentialRampToValueAtTime(note.frequency*.78,now+note.delay+.07);gain.gain.setValueAtTime(.0001,now+note.delay);gain.gain.exponentialRampToValueAtTime(.022,now+note.delay+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+note.delay+.085);tone.connect(gain);gain.connect(context.destination);tone.start(now+note.delay);tone.stop(now+note.delay+.09);}
 }catch{}
}
function renderSoundButton(){
 const button=document.querySelector('#sound-toggle');if(!button)return;
 button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',translateText(enabled?'Tắt âm thanh':'Bật âm thanh'));
 button.innerHTML=icon(enabled?'sound':'soundoff');
}
export function initEffects(){
 const button=document.querySelector('#sound-toggle');
 button?.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('oceo-sound',enabled?'1':'0');}catch{}renderSoundButton();if(enabled)playEffect('paper');});
 window.addEventListener('oceo-language-change',renderSoundButton);renderSoundButton();
}
