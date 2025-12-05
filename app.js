/* 🌫 background animation */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particlesArray = [];
const numParticles = 80;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.speedY = Math.random() * 0.6 - 0.3;
    this.alpha = Math.random() * 0.5 + 0.3;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,255,${this.alpha})`;
    ctx.fill();
  }
}

function init() {
  particlesArray = [];
  for (let i = 0; i < numParticles; i++) {
    particlesArray.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a; b < particlesArray.length; b++) {
      const dx = particlesArray[a].x - particlesArray[b].x;
      const dy = particlesArray[a].y - particlesArray[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        ctx.strokeStyle = `rgba(0,255,255,0.05)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  requestAnimationFrame(animate);
}
init();
animate();

/* 🌍 AQI search */
async function fetchAQI() {
  const city = document.getElementById("city").value || "Montreal";
  const resultBox = document.getElementById("aqiResult");
  resultBox.innerText = `🌫 Fetching air data for ${city}...`;

  try {
    const token = "0fef46e2cdafa6e579599bc56588fdf44a90e448";
    const res = await fetch(`https://api.waqi.info/search/?token=${token}&keyword=${city}`);
    const data = await res.json();

    if (data.status === "ok" && data.data.length > 0) {
      const aqi = parseInt(data.data[0].aqi);
      const station = data.data[0].station.name;

      let mood, color;
      if (aqi < 50) { mood = "🌿 Good"; color = "#00ffcc"; }
      else if (aqi < 100) { mood = "🌤 Moderate"; color = "#ffff66"; }
      else if (aqi < 150) { mood = "😷 Unhealthy"; color = "#ff9933"; }
      else { mood = "💀 Hazardous"; color = "#ff3333"; }

      resultBox.innerHTML = 
        `📍 <b>${station}</b><br>` +
        `AQI: <b style="color:${color}">${aqi}</b> — ${mood}`;
    } else {
      resultBox.innerText = "❌ City not found.";
    }
  } catch (err) {
    resultBox.innerText = "⚠️ Failed to fetch data.";
  }
}

// week 2
const donutCanvas = document.getElementById("donutBg");
if (donutCanvas) {
  const ctx = donutCanvas.getContext("2d");

  function resizeDonut() {
    const section = donutCanvas.closest(".entry");
    donutCanvas.width = section.offsetWidth;
    donutCanvas.height = section.offsetHeight;
  }
  resizeDonut();
  window.addEventListener("resize", resizeDonut);

  // icing palettes（糖霜配色）
  const PALETTES = [
    { base: [330, 92, 75], light: [330, 95, 88] }, // strawberry pink
    { base: [200, 85, 70], light: [200, 95, 86] }, // sky blue
    { base: [46, 90, 62],  light: [46, 95, 80]  }, // vanilla yellow
    { base: [270, 70, 68], light: [270, 85, 85] }, // lilac
  ];
  const SPRINKLE_COLORS = [
    [0, 90, 62], [140, 70, 55], [30, 95, 55], [210, 90, 60], [330, 90, 62]
  ];

  const donuts = Array.from({ length: 9 }).map(() => {
    const rOuter = 40 + Math.random() * 48;
    const rInner = rOuter * (0.35 + Math.random() * 0.08);
    const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    return {
      x: Math.random() * donutCanvas.width,
      y: Math.random() * donutCanvas.height,
      rOuter,
      rInner,
      hueBase: pal.base[0], satBase: pal.base[1], litBase: pal.base[2],
      hueLight: pal.light[0], satLight: pal.light[1], litLight: pal.light[2],
      speedY: 0.25 + Math.random() * 0.35,
      swayAmp: 8 + Math.random() * 10,
      swayFreq: 0.002 + Math.random() * 0.003,
      t: Math.random() * 1000,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: 0.001 + Math.random() * 0.002,
      sprinkles: Array.from({ length: 14 + Math.floor(Math.random() * 10) }).map(() => ({
        ang: Math.random() * Math.PI * 2,
        rad: null, // 运行时填
        len: 6 + Math.random() * 7,
        thk: 1.6 + Math.random() * 1.6,
        hue: SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)][0],
        sat: SPRINKLE_COLORS[0][1],
        lit: SPRINKLE_COLORS[0][2],
        tilt: (Math.random() - 0.5) * 1.8
      }))
    };
  });

  function hsl(h, s, l, a = 1) { return `hsla(${h} ${s}% ${l}% / ${a})`; }

  // 画“面团”层（温暖的烘焙色）
  function drawDough(d) {
    // 投影（地面影）
    ctx.save();
    ctx.translate(d.x, d.y + d.rOuter * 0.65);
    ctx.scale(1, 0.35);
    const shGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, d.rOuter * 0.9);
    shGrad.addColorStop(0, "rgba(0,0,0,0.22)");
    shGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.arc(0, 0, d.rOuter * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 面团本体（内外双层径向渐变，给一点烘烤深色边）
    ctx.save();
    ctx.translate(d.x, d.y);
    const doughGrad = ctx.createRadialGradient(0, 0, d.rInner * 0.7, 0, 0, d.rOuter);
    doughGrad.addColorStop(0, "hsl(34 70% 72%)");
    doughGrad.addColorStop(1, "hsl(28 65% 46%)");
    ctx.fillStyle = doughGrad;
    ctx.beginPath();
    ctx.arc(0, 0, d.rOuter, 0, Math.PI * 2);
    ctx.arc(0, 0, d.rInner, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  // 糖霜波浪环（外缘/内缘带微小起伏）
  function drawIcing(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);

    const steps = 60;
    const waveOuter = d.rOuter * 0.06;
    const waveInner = d.rInner * 0.12;

    // 外缘路径
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r = d.rOuter * 0.92 + Math.sin(a * 3 + d.t * 0.02) * waveOuter;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    // 内缘路径（反向）
    for (let i = steps; i >= 0; i--) {
      const a = (i / steps) * Math.PI * 2;
      const r = d.rInner * 1.15 + Math.sin(a * 2.5 + d.t * 0.018) * waveInner;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      ctx.lineTo(x, y);
    }

    // 糖霜渐变
    const icingGrad = ctx.createRadialGradient(0, -d.rOuter * 0.2, d.rInner * 0.3, 0, 0, d.rOuter);
    icingGrad.addColorStop(0, hsl(d.hueLight, d.satLight, d.litLight, 0.95));
    icingGrad.addColorStop(1, hsl(d.hueBase, d.satBase, d.litBase, 0.95));
    ctx.fillStyle = icingGrad;
    ctx.fill();

    // 顶部高光弧
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.arc(0, 0, d.rOuter * 0.78, -Math.PI * 0.85, -Math.PI * 0.45);
    ctx.stroke();

    // 内圈阴影（让洞更有深度）
    const innerGrad = ctx.createRadialGradient(0, 0, d.rInner * 0.7, 0, 0, d.rInner * 1.15);
    innerGrad.addColorStop(0, "rgba(0,0,0,0.25)");
    innerGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, d.rInner * 1.18, 0, Math.PI * 2);
    ctx.arc(0, 0, d.rInner * 0.9, 0, Math.PI * 2, true);
    ctx.fill();

    // 彩色糖针（落在糖霜带上）
    d.sprinkles.forEach(s => {
      // 在糖霜厚度范围内随机半径
      if (s.rad == null) {
        s.rad = d.rInner * 1.15 + Math.random() * (d.rOuter * 0.92 - d.rInner * 1.15);
      }
      const x = Math.cos(s.ang) * s.rad;
      const y = Math.sin(s.ang) * s.rad;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(s.tilt);
      ctx.fillStyle = `hsl(${s.hue} ${s.sat}% ${s.lit}%)`;
      // 画一个小胶囊（糖针）
      const w = s.len, h = s.thk, r = h / 2;
      ctx.beginPath();
      ctx.moveTo(-w/2 + r, -h/2);
      ctx.lineTo(w/2 - r, -h/2);
      ctx.arc(w/2 - r, 0, r, -Math.PI/2, Math.PI/2);
      ctx.lineTo(-w/2 + r, h/2);
      ctx.arc(-w/2 + r, 0, r, Math.PI/2, -Math.PI/2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  function drawDonut(d) {
    drawDough(d);
    drawIcing(d);
  }

  function animateDonuts() {
    ctx.clearRect(0, 0, donutCanvas.width, donutCanvas.height);
    donuts.forEach(d => {
      d.t += 1;
      d.y -= d.speedY;
      d.x += Math.sin(d.t * d.swayFreq) * (d.swayAmp * 0.02);
      d.rot += d.rotSpeed;

      // 循环上浮
      if (d.y + d.rOuter < 0) {
        d.y = donutCanvas.height + d.rOuter + Math.random() * 40;
        d.x = Math.random() * donutCanvas.width;
      }
      drawDonut(d);
    });
    requestAnimationFrame(animateDonuts);
  }

  animateDonuts();
}

// ------------------------------
// Week 3 Enhancements
// ------------------------------

// 选出 Week 3 这块
const week3Entry = Array.from(document.querySelectorAll(".entry")).find(e =>
  e.innerHTML.includes("Reflection: FLASK III and FETCH")
);

if (week3Entry) {
  // 滚动进入时淡入显示
  function fadeInWeek3() {
    const rect = week3Entry.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      week3Entry.style.transition = "opacity 1s ease, transform 1s ease";
      week3Entry.style.opacity = "1";
      week3Entry.style.transform = "translateY(0)";
      window.removeEventListener("scroll", fadeInWeek3);
    }
  }
  window.addEventListener("scroll", fadeInWeek3);

  // 标题呼吸光
  const week3Title = week3Entry.querySelector(".title");
  if (week3Title) {
    setInterval(() => {
      week3Title.style.textShadow = `0 0 ${Math.random() * 8}px #00ffff`;
    }, 600);
  }

  // 鼠标悬停 → 背景空气变色
  week3Entry.addEventListener("mouseenter", () => {
    week3Entry.style.transition = "background 2s";
    week3Entry.style.background = "rgba(20, 35, 55, 0.9)";
  });
  week3Entry.addEventListener("mouseleave", () => {
    week3Entry.style.background = "rgba(17, 24, 39, 0.85)";
  });
}

//week5
(function(){
  const R=4,C=8;
  let g=Array.from({length:R},()=>Array(C).fill(0));
  let loop=null, step=0, vis=-1;
  const $=s=>document.querySelector(s);

  function build(){
    const grid=$("#miniGrid");
    grid.innerHTML="";
    for(let r=0;r<R;r++){
      for(let c=0;c<C;c++){
        const cell=document.createElement("div");
        cell.className="mini-cell";
        cell.dataset.r=r; cell.dataset.c=c;
        cell.onclick=()=>{ g[r][c]=g[r][c]?0:1; cell.classList.toggle("on",!!g[r][c]); };
        grid.appendChild(cell);
      }
    }
  }
  function syncUI(){
    document.querySelectorAll("#miniGrid .mini-cell").forEach(el=>{
      const r=+el.dataset.r, c=+el.dataset.c;
      el.classList.toggle("on", !!g[r][c]);
    });
  }
  function colCells(c){ return Array.from(document.querySelectorAll(`#miniGrid .mini-cell[data-c="${c}"]`)); }
  function hi(c){
    if(vis>=0) colCells(vis).forEach(el=>el.classList.remove("now"));
    colCells(c).forEach(el=>{ el.classList.add("now"); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),140); });
    vis=c;
  }
  function kit(){
    return [
      new Tone.MembraneSynth({octaves:2,pitchDecay:.02,envelope:{attack:.001,decay:.2,sustain:0,release:.05}}).toDestination(),
      new Tone.NoiseSynth({noise:{type:'white'},envelope:{attack:.001,decay:.12,sustain:0}}).toDestination(),
      new Tone.MetalSynth({frequency:400,modulationIndex:8,resonance:300,harmonicity:10}).toDestination(),
      new Tone.Synth({oscillator:{type:'square'},envelope:{attack:.005,decay:.08,sustain:.1,release:.1}}).toDestination()
    ];
  }
  let synths=null;
  function ensure(){ if(!synths) synths=kit(); return synths; }

  function tune(){
    try{ Tone.context.latencyHint="interactive"; }catch(e){}
    Tone.Draw.anticipation=0.02;
  }

  async function play(){
    await Tone.start(); tune(); ensure();
    stop();
    step=0; vis=-1;
    document.querySelectorAll("#miniGrid .mini-cell.now").forEach(el=>el.classList.remove("now"));
    loop=new Tone.Loop((time)=>{
      const s=step;
      Tone.Draw.schedule(()=>hi(s), time);
      for(let r=0;r<R;r++){
        if(g[r][s]){
          if(r===0) synths[0].triggerAttackRelease("C2","8n",time,.8);
          else if(r===1) synths[1].triggerAttackRelease("8n",time,.7);
          else if(r===2) synths[2].triggerAttackRelease("16n",time,.6);
          else if(r===3) synths[3].triggerAttackRelease("C4","16n",time,.5);
        }
      }
      step=(step+1)%C;
    },"16n");
    Tone.Transport.bpm.value=+($("#miniBpm").value||110);
    loop.start(0); Tone.Transport.start();
  }

  function stop(){
    if(loop){ loop.stop(); loop.dispose(); loop=null; }
    Tone.Transport.stop();
    document.querySelectorAll("#miniGrid .mini-cell.now").forEach(el=>el.classList.remove("now"));
    vis=-1;
  }

  function rand(){
    g=g.map(row=>row.map(()=>Math.random()<0.25?1:0));
    syncUI();
  }
  function clr(){
    g=g.map(row=>row.map(()=>0));
    syncUI();
  }

  window.addEventListener("DOMContentLoaded", ()=>{
    build(); syncUI();
    $("#miniBpm").addEventListener("input", e=>{ $("#miniBpmVal").textContent=e.target.value; Tone.Transport.bpm.value=+e.target.value; });
    $("#miniBpmVal").textContent=$("#miniBpm").value;
    $("#miniPlay").onclick=play;
    $("#miniStop").onclick=stop;
    $("#miniRandom").onclick=rand;
    $("#miniClear").onclick=clr;
  });
})();

// =============================
// Enhanced Pattern Visualizer (Week 7)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("patternCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const entry = document.querySelector(".entry.week7");
  if (!entry) return;

  const vizModeSelect = document.getElementById("vizMode");
  const randomizeBtn = document.getElementById("randomizeViz");
  const resetBtn = document.getElementById("resetViz");
  const exportBtn = document.getElementById("exportImg");
  const particleCountSpan = document.getElementById("particleCount");
  const fpsSpan = document.getElementById("fpsCounter");

  let particles = [];
  let mouseX = 0, mouseY = 0;
  let currentVizMode = "nebula";
  let frameCount = 0;
  let lastFpsUpdate = Date.now();
  
  function resizeCanvas() {
    const rect = entry.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  class Particle {
    constructor(x, y) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = Math.random() * 3 + 1;
      this.hue = Math.random() * 360;
      this.alpha = Math.random() * 0.5 + 0.5;
      this.trail = [];
      this.maxTrail = 10;
    }

    update() {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.vx += dx * force * 0.01;
        this.vy += dy * force * 0.01;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      
      this.x = Math.max(0, Math.min(canvas.width, this.x));
      this.y = Math.max(0, Math.min(canvas.height, this.y));

      this.trail.unshift({x: this.x, y: this.y});
      if (this.trail.length > this.maxTrail) this.trail.pop();
    }

    draw() {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const alpha = (1 - i / this.trail.length) * this.alpha * 0.3;
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      gradient.addColorStop(0, `hsla(${this.hue}, 90%, 70%, ${this.alpha})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 90%, 50%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    let count = 200;

    switch(currentVizMode) {
      case "nebula":
        count = 300;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * Math.min(canvas.width, canvas.height) * 0.3;
          const x = canvas.width / 2 + Math.cos(angle) * radius;
          const y = canvas.height / 2 + Math.sin(angle) * radius;
          particles.push(new Particle(x, y));
        }
        break;

      case "matrix":
        count = 150;
        for (let i = 0; i < count; i++) {
          const p = new Particle();
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height - canvas.height;
          p.vx = 0;
          p.vy = Math.random() * 3 + 2;
          p.hue = 120;
          p.trail.maxTrail = 30;
          particles.push(p);
        }
        break;

      case "dna":
        count = 200;
        for (let i = 0; i < count; i++) {
          const p = new Particle();
          p.angle = (i / count) * Math.PI * 4;
          p.radius = Math.min(canvas.width, canvas.height) * 0.2;
          p.x = canvas.width / 2 + Math.cos(p.angle) * p.radius;
          p.y = canvas.height / 2 + Math.sin(p.angle) * p.radius * 0.3;
          p.hue = i % 2 === 0 ? 200 : 300;
          particles.push(p);
        }
        break;

      case "network":
        count = 100;
        for (let i = 0; i < count; i++) {
          particles.push(new Particle());
        }
        break;

      case "galaxy":
        count = 400;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 4 + Math.random() * 0.5;
          const radius = (i / count) * Math.min(canvas.width, canvas.height) * 0.4;
          const x = canvas.width / 2 + Math.cos(angle) * radius;
          const y = canvas.height / 2 + Math.sin(angle) * radius;
          const p = new Particle(x, y);
          p.hue = (i / count) * 360;
          particles.push(p);
        }
        break;

      case "waves":
        count = 250;
        for (let i = 0; i < count; i++) {
          const p = new Particle();
          p.x = (i / count) * canvas.width;
          p.y = canvas.height / 2 + Math.sin(i * 0.1) * 50;
          p.hue = (i / count) * 360;
          particles.push(p);
        }
        break;
    }

    particleCountSpan.textContent = `Particles: ${particles.length}`;
  }

  function drawConnections() {
    if (currentVizMode !== "network") return;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          const alpha = (100 - dist) / 100 * 0.3;
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function renderDNA() {
    if (currentVizMode !== "dna") return;
    
    for (let i = 0; i < particles.length - 1; i++) {
      if (i % 2 === 0) {
        const p1 = particles[i];
        const p2 = particles[i + 1];
        
        ctx.strokeStyle = `rgba(100, 200, 255, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    
    particles.forEach((p, i) => {
      p.angle += 0.01;
      p.x = canvas.width / 2 + Math.cos(p.angle) * p.radius;
      p.y = canvas.height / 2 + (i / particles.length - 0.5) * canvas.height * 0.8;
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(15, 17, 26, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    renderDNA();

    frameCount++;
    if (Date.now() - lastFpsUpdate > 1000) {
      fpsSpan.textContent = `FPS: ${frameCount}`;
      frameCount = 0;
      lastFpsUpdate = Date.now();
    }
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  vizModeSelect.addEventListener("change", (e) => {
    currentVizMode = e.target.value;
    initParticles();
  });

  randomizeBtn.addEventListener("click", () => {
    particles.forEach(p => {
      p.vx = (Math.random() - 0.5) * 4;
      p.vy = (Math.random() - 0.5) * 4;
      p.hue = Math.random() * 360;
    });
  });

  resetBtn.addEventListener("click", () => {
    initParticles();
  });

  exportBtn.addEventListener("click", () => {
    const originalOpacity = canvas.style.opacity;
    canvas.style.opacity = '1';
    
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `pattern_${currentVizMode}_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      canvas.style.opacity = originalOpacity;
    }, 100);
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });

  resizeCanvas();
  initParticles();
  animate();
});