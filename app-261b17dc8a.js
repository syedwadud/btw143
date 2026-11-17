(()=>{
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion:reduce)'),video=document.querySelector('#ocean-video'),theme=document.querySelector('.theme-toggle');
root.dataset.theme='dark';
theme.addEventListener('click',()=>{const inverted=root.dataset.theme!=='inverted';root.dataset.theme=inverted?'inverted':'dark';theme.setAttribute('aria-pressed',String(inverted));theme.setAttribute('aria-label',inverted?'Switch to dark mode':'Switch to inverted mode');});
if(location.protocol!=='file:'&&/\/index\.html$/.test(location.pathname)){const clean=new URL('./',location.href);history.replaceState({},'',clean.pathname+location.search+location.hash);}
const waterSource=video.querySelector('source');let waterLoaded=false,waterTimer=0;
function loadWater(){if(reduced.matches||waterLoaded)return;const source=waterSource.dataset.src;if(source){waterSource.src=source;waterLoaded=true;video.load();}if(document.visibilityState==='visible')video.play().catch(()=>{});}
function scheduleWater(){if(!reduced.matches&&!waterLoaded)waterTimer=window.setTimeout(loadWater,900);else if(!reduced.matches&&document.visibilityState==='visible')video.play().catch(()=>{});}
scheduleWater();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleWater();else video.pause();});
reduced.addEventListener('change',()=>{if(reduced.matches){clearTimeout(waterTimer);video.pause();}else scheduleWater();});
if('IntersectionObserver'in window){const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in-view');reveal.unobserve(e.target);}},{threshold:.08});if(!reduced.matches){root.classList.add('motion-ready');document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));}const sectionObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-20% 0px -55% 0px'});document.querySelectorAll('main>section').forEach(s=>sectionObserver.observe(s));}
const canvas=document.querySelector('#ocean-ripples'),ctx=canvas.getContext('2d');let ripples=[],frame=0,last=0,lastX=-100,lastY=-100;
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}resize();addEventListener('resize',resize);
function draw(now){ctx.clearRect(0,0,innerWidth,innerHeight);ripples=ripples.filter(r=>now-r.born<1500);for(const r of ripples){const t=(now-r.born)/1500;ctx.beginPath();ctx.ellipse(r.x,r.y,8+t*70,4+t*30,0,0,Math.PI*2);ctx.strokeStyle='rgba(188,225,224,'+((1-t)*.18)+')';ctx.lineWidth=.7;ctx.stroke();}frame=ripples.length?requestAnimationFrame(draw):0;}
addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches||!matchMedia('(pointer:fine)').matches)return;const now=performance.now();if(now-last<100||Math.hypot(e.clientX-lastX,e.clientY-lastY)<18)return;last=now;lastX=e.clientX;lastY=e.clientY;ripples.push({x:e.clientX,y:e.clientY,born:now});if(ripples.length>14)ripples.shift();if(!frame)frame=requestAnimationFrame(draw);},{passive:true});
const audio=document.querySelector('#album-audio');
if(audio){
  const rows=[...document.querySelectorAll('[data-track-row]')],playerButton=document.querySelector('[data-player-toggle]'),previousButton=document.querySelector('[data-player-previous]'),nextButton=document.querySelector('[data-player-next]'),title=document.querySelector('[data-current-title]'),status=document.querySelector('[data-player-status]'),autoplay=document.querySelector('[data-autoplay]'),time=document.querySelector('[data-player-time]');
  let current=-1;
  const glyph=playing=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${playing?'<path d="M8 5v14M16 5v14"/>':'<path d="m8 5 12 7-12 7Z"/>'}</svg>`;
  const clock=value=>Number.isFinite(value)?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'0:00';
  function update(){const playing=!audio.paused;playerButton.innerHTML=glyph(playing);playerButton.setAttribute('aria-pressed',String(playing));playerButton.setAttribute('aria-label',playing?'Pause album':'Play album');rows.forEach((row,i)=>{const button=row.querySelector('[data-track-play]'),active=i===current&&playing;button.innerHTML=glyph(active);button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',`${active?'Pause':'Play'} ${row.dataset.title}`);row.classList.toggle('is-playing',i===current);});if(current>=0)time.textContent=`${clock(audio.currentTime)} / ${clock(audio.duration)}`;}
  async function startTrack(index,playNow=true){if(index<0||index>=rows.length)return;current=index;const row=rows[index];title.textContent=row.dataset.title;audio.src=row.dataset.audioSrc;audio.load();update();if(playNow){try{await audio.play();status.textContent='Playing from BTW143.space.';}catch{status.textContent='Audio could not start. Press play to try again.';}update();}}
  function stepTrack(direction){const wasPlaying=current>=0&&!audio.paused;let target=current<0?0:current+direction;if(direction<0&&current>=0&&audio.currentTime>3)target=current;if(target<0)target=0;if(target>=rows.length)target=rows.length-1;startTrack(target,wasPlaying);}
  previousButton.addEventListener('click',()=>stepTrack(-1));
  nextButton.addEventListener('click',()=>stepTrack(1));
  rows.forEach((row,index)=>row.querySelector('[data-track-play]').addEventListener('click',()=>{if(index===current&&!audio.paused)audio.pause();else startTrack(index,true);}));
  playerButton.addEventListener('click',()=>{if(audio.paused){if(current<0)startTrack(0,true);else audio.play().catch(()=>{status.textContent='Audio could not start. Press play to try again.';});}else audio.pause();});
  audio.addEventListener('play',()=>{status.textContent='Playing from BTW143.space.';update();});
  audio.addEventListener('pause',()=>{if(current>=0)status.textContent='Paused.';update();});
  audio.addEventListener('timeupdate',update);
  audio.addEventListener('loadedmetadata',update);
  audio.addEventListener('ended',()=>{if(autoplay.checked&&current<rows.length-1)startTrack(current+1,true);else{status.textContent=current===rows.length-1?'Album complete.':'Track complete.';update();}});
  autoplay.addEventListener('change',()=>{status.textContent=autoplay.checked?'Autoplay next is on.':'Autoplay next is off.';});
  audio.addEventListener('error',()=>{status.textContent='This track could not be loaded. Please try again.';update();});
}
})();

