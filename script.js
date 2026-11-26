const scenes = [...document.querySelectorAll('.scene')];
function showScene(id){
  scenes.forEach(scene=>scene.classList.toggle('active',scene.id===id));
}
// ───────────────────────────────────────────────────────────
// TEXTO FINAL EN PIXEL ART
// Cada letra es un mapa de bits ("#" = píxel negro) que se convierte en un SVG
// de cuadrados de borde duro. Para cambiar o agregar letras, editá PIXEL_FONT.
// ───────────────────────────────────────────────────────────
const PIXEL_FONT = {
  F:['#####','#....','#....','####.','#....','#....','#....'],
  E:['#####','#....','#....','####.','#....','#....','#####'],
  L:['#....','#....','#....','#....','#....','#....','#####'],
  I:['#####','..#..','..#..','..#..','..#..','..#..','#####'],
  Z:['#####','....#','...#.','..#..','.#...','#....','#####'],
  C:['.####','#....','#....','#....','#....','#....','.####'],
  U:['#...#','#...#','#...#','#...#','#...#','#...#','.###.'],
  M:['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],
  P:['####.','#...#','#...#','####.','#....','#....','#....'],
  A:['.###.','#...#','#...#','#####','#...#','#...#','#...#'],
  O:['.###.','#...#','#...#','#...#','#...#','#...#','.###.'],
  S:['.####','#....','#....','.###.','....#','....#','####.'],
  X:['#...#','#...#','.#.#.','..#..','.#.#.','#...#','#...#'],
  // La Ñ es una N de 7 filas con una tilde de 2 filas arriba (9 filas en total).
  'Ñ':['.#..#','#.##.','#...#','##..#','#.#.#','#..##','#...#','#...#','#...#']
};
function stampBitmap(grid,bitmap,x0,y0){
  bitmap.forEach((row,y)=>[...row].forEach((c,x)=>{ if(c==='#')grid[y0+y][x0+x]=1; }));
}
function textBitmap(text){
  const H=9,gap=1;
  const glyphs=[...text].map(ch=>PIXEL_FONT[ch]);
  const W=glyphs.reduce((n,g)=>n+g[0].length,0)+gap*(glyphs.length-1);
  const grid=Array.from({length:H},()=>Array(W).fill(0));
  let x=0;
  glyphs.forEach(g=>{
    stampBitmap(grid,g,x,H-g.length);   // alinea la base de cada letra
    x+=g[0].length+gap;
  });
  return grid;
}
function bitmapToSVG(grid){
  const H=grid.length,W=grid[0].length;
  let d='';
  grid.forEach((row,y)=>{               // une píxeles contiguos de la fila en un solo rectángulo
    let x=0;
    while(x<W){
      if(!row[x]){x++;continue;}
      let start=x;
      while(x<W&&row[x])x++;
      d+=`M${start} ${y}h${x-start}v1h-${x-start}z`;
    }
  });
  return {W,H,svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" focusable="false"><path d="${d}"/></svg>`};
}
function renderPixelArt(){
  document.querySelectorAll('.px').forEach(el=>{
    const grid=textBitmap(el.dataset.text);
    const {W,H,svg}=bitmapToSVG(grid);
    const k=parseFloat(el.dataset.k||'1');
    el.innerHTML=svg;
    // Tamaño en múltiplos de una celda base (--cell se define en CSS y se adapta al ancho de pantalla).
    el.style.width=`calc(var(--cell) * ${W} * ${k})`;
    el.style.aspectRatio=`${W} / ${H}`;
  });
}
renderPixelArt();

// ───────────────────────────────────────────────────────────
// INTRO: fotogramas reales del GIF original (assets/intro/f00…f16.png)
// Cada fotograma conserva la duración del GIF (60–70 ms). El tamaño w×h está
// en píxeles del GIF original; se escala con INTRO_K para adaptarse a la pantalla.
// ───────────────────────────────────────────────────────────
const INTRO_FRAMES=[{"src":"assets/intro/f00.png","w":195,"h":133,"ms":70},{"src":"assets/intro/f01.png","w":195,"h":133,"ms":60},{"src":"assets/intro/f02.png","w":200,"h":59,"ms":70},{"src":"assets/intro/f03.png","w":200,"h":59,"ms":70},{"src":"assets/intro/f04.png","w":200,"h":59,"ms":60},{"src":"assets/intro/f05.png","w":200,"h":59,"ms":70},{"src":"assets/intro/f06.png","w":139,"h":36,"ms":70},{"src":"assets/intro/f07.png","w":136,"h":42,"ms":60},{"src":"assets/intro/f08.png","w":136,"h":42,"ms":70},{"src":"assets/intro/f09.png","w":136,"h":42,"ms":70},{"src":"assets/intro/f10.png","w":261,"h":61,"ms":60},{"src":"assets/intro/f11.png","w":261,"h":61,"ms":70},{"src":"assets/intro/f12.png","w":261,"h":61,"ms":70},{"src":"assets/intro/f13.png","w":261,"h":61,"ms":60},{"src":"assets/intro/f14.png","w":261,"h":61,"ms":70},{"src":"assets/intro/f15.png","w":362,"h":155,"ms":70},{"src":"assets/intro/f16.png","w":233,"h":61,"ms":70}];
// Ritmo de la intro (editá estos números):
// La secuencia se estira o encoge sola para durar EXACTAMENTE lo que dura la canción (assets/vanity-sound.ogg),
// así el sonido suena una sola vez y termina justo cuando aparece el texto final.
const INTRO_FALLBACK_MS=3980;  // duración de la canción si el navegador aún no la informó
const INTRO_FACE=[0,1];        // fotogramas de la carita ^q^
const INTRO_FACE_TURNS=3;      // cuántas veces alterna la carita (solo al principio)
const INTRO_WEAPON_LOOPS=2;    // cuántas veces se repite el ciclo de armas (fotogramas 2 a 16): más tiempo en pantalla que la carita
const intro=document.getElementById('intro');
const introStart=document.getElementById('startJourney');
const introTap=document.getElementById('introTap');
const introFrame=document.getElementById('introFrame');
const introAudio=new Audio();
// OGG donde se pueda; MP3 de respaldo (p. ej. Safari antiguo).
introAudio.src=introAudio.canPlayType('audio/ogg; codecs="vorbis"')?'assets/vanity-sound.ogg':'assets/vanity-sound.mp3';
introAudio.preload='auto';
INTRO_FRAMES.forEach(f=>{const im=new Image();im.src=f.src;});   // precarga para que no haya parpadeos
let introTimer=null;
let introFinished=false;
let introRun=0;                            // identifica cada reproducción para ignorar temporizadores viejos
function layoutIntro(){
  // Escala: la carita (≈195 px del GIF) ocupa ~86% del ancho en celular y como mucho 50% del alto en PC.
  const k=Math.min(innerWidth*.86/195,innerHeight*.5/133,4.5);
  intro.style.setProperty('--k',k);
}
function showFrame(i){
  const f=INTRO_FRAMES[i];
  introFrame.src=f.src;
  introFrame.style.width=`calc(${f.w}px * var(--k))`;
}
function stopIntro(){
  clearTimeout(introTimer);introTimer=null;introRun++;
  try{introAudio.pause();introAudio.currentTime=0;}catch(_){}
}
function runIntro(){
  const run=++introRun;
  intro.classList.remove('phase-wait','phase-finale');
  introTap.classList.add('hidden');
  introStart.classList.remove('ready');
  introFinished=false;
  layoutIntro();
  // Lista de fotogramas: carita (una vez) y después las armas, repetidas varias veces.
  const weapons=INTRO_FRAMES.map((_,i)=>i).filter(i=>!INTRO_FACE.includes(i));
  const order=[];
  for(let t=0;t<INTRO_FACE_TURNS;t++)order.push(...INTRO_FACE);
  for(let l=0;l<INTRO_WEAPON_LOOPS;l++)order.push(...weapons);
  // Duración total = duración de la canción. Cada fotograma conserva su proporción de tiempo respecto del GIF.
  const total=(Number.isFinite(introAudio.duration)&&introAudio.duration>0)?introAudio.duration*1000:INTRO_FALLBACK_MS;
  const base=order.reduce((n,i)=>n+INTRO_FRAMES[i].ms,0);
  const scale=total/base;
  const ends=[];let acc=0;
  order.forEach(i=>{acc+=INTRO_FRAMES[i].ms*scale;ends.push(acc);});
  const t0=performance.now();
  let step=0;
  (function next(){
    if(run!==introRun)return;
    if(step>=order.length){                // fin de la secuencia (= fin de la canción) → texto final
      introAudio.pause();
      intro.classList.add('phase-finale');
      introFinished=true;
      introStart.classList.add('ready');
      return;
    }
    const i=order[step];
    showFrame(i);
    const wait=Math.max(0,ends[step]-(performance.now()-t0));   // se programa contra el reloj para no acumular retraso
    step++;
    introTimer=setTimeout(next,wait);
  })();
}
function playIntro(){
  stopIntro();
  intro.classList.remove('phase-finale');
  layoutIntro();
  showFrame(0);
  introStart.classList.remove('ready');
  introFinished=false;
  // Los navegadores suelen bloquear el sonido hasta que la persona toca la pantalla.
  // Si el sonido arranca solo, la intro empieza de inmediato; si no, se pide un toque.
  let started=false;
  const begin=()=>{ if(started)return; started=true; runIntro(); };
  let p;
  try{p=introAudio.play();}catch(_){p=Promise.reject();}
  if(p&&p.then){
    p.then(begin).catch(()=>{
      intro.classList.add('phase-wait');           // muestra la carita quieta + botón
      introTap.classList.remove('hidden');
    });
  }else begin();
}
introTap.addEventListener('click',()=>{
  introAudio.currentTime=0;
  const p=introAudio.play();                       // este toque sí permite el sonido
  if(p&&p.catch)p.catch(()=>{});                   // si igual falla, la intro sigue sin sonido
  runIntro();
});
addEventListener('resize',layoutIntro);
playIntro();

introStart.addEventListener('click',()=>{
  if(!introFinished)return;
  stopIntro();
  showScene('letterScene');
});

const envelope=document.getElementById('envelope');
const letterCard=document.getElementById('letterCard');
let opened=false;
function openLetter(){
  if(opened)return;
  opened=true;
  envelope.classList.add('opened');
  document.getElementById('envelopeHint').textContent='';
  setTimeout(()=>{
    letterCard.classList.add('visible');
    letterCard.setAttribute('aria-hidden','false');
  },450);
}
envelope.addEventListener('click',openLetter);
document.getElementById('skipLetter').addEventListener('click',()=>{
  openLetter();
  setTimeout(()=>letterCard.scrollIntoView({block:'center',behavior:'smooth'}),100);
});
document.getElementById('toCat').addEventListener('click',()=>showScene('catScene'));

// Inclinación 3D del sobre con mouse o lápiz; la flotación sigue activa en móvil.
envelope.addEventListener('pointermove',event=>{
  if(opened || event.pointerType==='touch')return;
  const rect=envelope.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width-.5;
  const y=(event.clientY-rect.top)/rect.height-.5;
  envelope.style.setProperty('--tilt-x',`${-y*12}deg`);
  envelope.style.setProperty('--tilt-y',`${x*17}deg`);
});
envelope.addEventListener('pointerleave',()=>{
  envelope.style.setProperty('--tilt-x','0deg');
  envelope.style.setProperty('--tilt-y','0deg');
});

// Sonidos y confeti del minijuego. OGG/Opus donde se pueda; MP3 de respaldo (Safari).
function loadSound(name){
  const a=new Audio();
  a.src=a.canPlayType('audio/ogg; codecs="opus"')?`assets/${name}.ogg`:`assets/${name}.mp3`;
  a.preload='auto';
  return a;
}
const nomSound=loadSound('nomnom');
const yaySound=loadSound('yay');
function playSound(a){
  try{a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{});}catch(_){}
}
const confetti=document.getElementById('confetti');
let confettiTimer=null;
const CONFETTI_MS=6800;                    // un ciclo completo del GIF (6,76 s)
function showConfetti(){
  clearTimeout(confettiTimer);
  // El GIF es apaisado (390×242): se reparte en mosaico con su tamaño natural (algo ampliado en pantallas grandes)
  // y copias espejadas, así las piezas no se estiran en celulares verticales ni se ve la repetición.
  const s=Math.min(Math.max(innerWidth/390,1),1.5);
  const tw=390*s,th=242*s;
  const cols=Math.ceil(innerWidth/tw),rows=Math.ceil(innerHeight/th);
  const stamp=Date.now();                    // el parámetro reinicia el GIF desde el primer fotograma
  confetti.replaceChildren();
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const im=new Image();
    im.alt='';im.draggable=false;
    im.src=`assets/confeti.gif?t=${stamp}`;
    im.style.cssText=`left:${c*tw}px;top:${r*th}px;width:${tw}px;height:${th}px;transform:scale(${c%2?-1:1},${r%2?-1:1})`;
    confetti.appendChild(im);
  }
  confetti.classList.add('show');
  confettiTimer=setTimeout(hideConfetti,CONFETTI_MS);
}
function hideConfetti(){
  clearTimeout(confettiTimer);
  confetti.classList.remove('show');
  confetti.replaceChildren();
}
function stopSounds(){
  [nomSound,yaySound].forEach(a=>{try{a.pause();a.currentTime=0;}catch(_){}});
  clearTimeout(yayTimer);
}
let yayTimer=null;

// Música del dibujo (assets/hydrogen.ogg): empieza al aparecer el dibujo, con fade-in, y se puede silenciar.
const artMusic=loadSound('hydrogen');
artMusic.preload='none';                   // pesa ~5 MB: se empieza a bajar recién cuando se completa el minijuego
artMusic.loop=true;
const ART_MUSIC_VOLUME=0.6;                // la canción original es fuerte; bajá este número si todavía suena alta (0 a 1)
const musicToggle=document.getElementById('musicToggle');
let musicOn=true;
let fadeFrame=null;
function fadeMusicTo(target,ms){
  cancelAnimationFrame(fadeFrame);
  const from=artMusic.volume,t0=performance.now();
  (function step(now){
    const k=Math.max(0,Math.min(1,(now-t0)/ms));
    artMusic.volume=Math.max(0,Math.min(1,from+(target-from)*k));
    if(k<1)fadeFrame=requestAnimationFrame(step);
  })(t0);
}
function startArtMusic(){
  if(!musicOn)return;
  artMusic.volume=0;
  const p=artMusic.play();
  if(p&&p.catch)p.catch(()=>{});
  fadeMusicTo(ART_MUSIC_VOLUME,2500);
}
function stopArtMusic(){
  cancelAnimationFrame(fadeFrame);
  try{artMusic.pause();artMusic.currentTime=0;}catch(_){}
}
function setMusicOn(on){
  musicOn=on;
  musicToggle.textContent=on?'♪ Música: sí':'♪ Música: no';
  musicToggle.setAttribute('aria-pressed',String(on));
  if(on)startArtMusic(); else{cancelAnimationFrame(fadeFrame);artMusic.pause();}
}
function resetArtMusic(){                 // al volver a empezar: música detenida y el interruptor otra vez en “sí”
  stopArtMusic();
  musicOn=true;
  musicToggle.textContent='♪ Música: sí';
  musicToggle.setAttribute('aria-pressed','true');
}
musicToggle.addEventListener('click',()=>setMusicOn(!musicOn));

// Minijuego: arrastrar físicamente las cerezas hasta la zona del gatito.
let fed=0;
let dragging=false;
let ghost=null;
let pointerId=null;
const cat=document.getElementById('cat');
const catStage=document.getElementById('catStage');
const cherry=document.getElementById('cherry');
const heart=document.getElementById('catHeart');
const feedCount=document.getElementById('feedCount');
const feedProgress=document.getElementById('feedProgress');
const catMessage=document.getElementById('catMessage');
const toGift=document.getElementById('toGift');
const messages=[
  '¡Ñam! Una cereza deliciosa.',
  '¡Otra más! El michi está contentísimo.',
  '¡Tres cerezas! El gatito quiere mostrarte algo.'
];
function setGhostPosition(x,y){
  if(ghost) {ghost.style.left=`${x}px`;ghost.style.top=`${y}px`;}
}
function startDrag(event){
  if(fed>=3 || dragging)return;
  event.preventDefault();
  dragging=true;
  pointerId=event.pointerId;
  cherry.classList.add('dragging');
  ghost=document.createElement('div');
  ghost.className='cherry-ghost';
  ghost.innerHTML='<img src="assets/cereza.png" alt="" draggable="false">';
  document.body.appendChild(ghost);
  setGhostPosition(event.clientX,event.clientY);
  try{cherry.setPointerCapture(pointerId);}catch(_){}
}
function moveDrag(event){
  if(!dragging || event.pointerId!==pointerId)return;
  event.preventDefault();
  setGhostPosition(event.clientX,event.clientY);
  const rect=catStage.getBoundingClientRect();
  const over=event.clientX>=rect.left && event.clientX<=rect.right &&
    event.clientY>=rect.top && event.clientY<=rect.bottom;
  catStage.classList.toggle('drag-over',over);
}
function endDrag(){
  dragging=false;
  pointerId=null;
  cherry.classList.remove('dragging');
  catStage.classList.remove('drag-over');
  ghost?.remove();ghost=null;
}
function finishDrag(event){
  if(!dragging || event.pointerId!==pointerId)return;
  // Colisión: el punto donde se suelta la cereza debe caer sobre el animal (con un pequeño margen).
  const rect=cat.getBoundingClientRect();
  const hit=event.type!=='pointercancel' &&
    event.clientX>=rect.left-35 && event.clientX<=rect.right+35 &&
    event.clientY>=rect.top-25 && event.clientY<=rect.bottom+25;
  endDrag();
  if(hit)feedCat();
}
function playCatAnim(cls){               // reinicia una animación del gato (contraerse, caricia…)
  cat.classList.remove('eating','petted');
  void cat.offsetWidth;
  cat.classList.add(cls);
}
function feedCat(){
  if(fed>=3)return;
  fed++;
  playCatAnim('eating');                   // el gato se contrae y rebota al comer
  playSound(nomSound);                     // ¡ñam ñam!
  heart.classList.add('show');
  feedCount.textContent=`CEREZAS: ${fed} / 3`;
  feedProgress.style.width=`${fed/3*100}%`;
  catMessage.textContent=messages[fed-1];
  cherry.disabled=fed>=3;
  if(fed===3){
    toGift.classList.remove('hidden');
    catMessage.textContent='¡Misión cumplida! El gatito te preparó una sorpresa.';
    // Tras el último ñam: confeti y festejo.
    yayTimer=setTimeout(()=>{ playSound(yaySound); showConfetti(); },700);
    artMusic.preload='auto'; artMusic.load();   // va bajando la canción del dibujo mientras suena el festejo
  }
}

// Caricias: tocar o frotar al gatito lo hace apretarse y salen corazones.
let lastPet=0;
function petCat(event){
  const now=performance.now();
  if(now-lastPet<380)return;               // no más de una reacción cada ~0,4 s
  lastPet=now;
  playCatAnim('petted');
  const r=catStage.getBoundingClientRect();
  const h=document.createElement('span');
  h.className='pet-heart';
  h.textContent='♡';
  h.style.left=`${event.clientX-r.left+(Math.random()*30-15)}px`;
  h.style.top=`${event.clientY-r.top-10}px`;
  catStage.appendChild(h);
  h.addEventListener('animationend',()=>h.remove());
}
cat.addEventListener('pointerdown',petCat);
cat.addEventListener('pointermove',event=>{ if(event.buttons&1)petCat(event); });
cherry.addEventListener('pointerdown',startDrag);
cherry.addEventListener('pointermove',moveDrag);
cherry.addEventListener('pointerup',finishDrag);
cherry.addEventListener('pointercancel',finishDrag);
cherry.addEventListener('lostpointercapture',event=>{ if(dragging && event.pointerId===pointerId)endDrag(); });
// Alternativa accesible con teclado sin sustituir el arrastre para mouse y pantalla táctil.
cherry.addEventListener('keydown',event=>{
  if((event.key==='Enter'||event.key===' ') && fed<3){
    event.preventDefault();
    feedCat();
  }
});
toGift.addEventListener('click',()=>showScene('giftScene'));

const giftBox=document.getElementById('giftBox');
let giftOpened=false;
giftBox.addEventListener('click',()=>{
  if(giftOpened)return;
  giftOpened=true;
  giftBox.classList.add('open');
  document.getElementById('giftHint').textContent='¡Tu sorpresa está acá!';
  setTimeout(()=>{ showScene('artScene'); startArtMusic(); },850);
});

document.getElementById('restart').addEventListener('click',()=>{
  fed=0;opened=false;giftOpened=false;endDrag();
  envelope.classList.remove('opened');
  envelope.style.removeProperty('--tilt-x');
  envelope.style.removeProperty('--tilt-y');
  letterCard.classList.remove('visible');
  letterCard.setAttribute('aria-hidden','true');
  document.getElementById('envelopeHint').textContent='Tocá el sobre para abrirlo';
  feedCount.textContent='CEREZAS: 0 / 3';
  feedProgress.style.width='0%';
  catMessage.textContent='El gatito te está mirando... ¡también podés acariciarlo!';
  toGift.classList.add('hidden');
  cherry.disabled=false;
  cat.classList.remove('eating','petted');
  stopSounds();hideConfetti();resetArtMusic();
  heart.classList.remove('show');
  giftBox.classList.remove('open');
  document.getElementById('giftHint').textContent='Un regalo hecho con mucho cariño';
  showScene('intro');
  playIntro();
});
