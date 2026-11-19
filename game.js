// ==========================================
// 1. RETRO 8-BIT AUDIO & SFX ENGINE
// ==========================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let musicMuted = false;
let musicInterval = null;
let noteIndex = 0;

const melody = [
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25,
  587.33, 698.46, 880.00, 1174.66, 880.00, 698.46,
  523.25, 659.25, 783.99, 659.25, 587.33, 493.88,
  523.25, 0,      392.00, 0,       523.25, 0
];

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, duration, type = 'square', volume = 0.05) {
  if (musicMuted || !freq) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function startRetroMusic() {
  if (musicInterval) return;
  musicInterval = setInterval(() => {
    if (!musicMuted && audioCtx && audioCtx.state === 'running') {
      const speedBoost = feverTimer > 0 ? 1.25 : 1;
      playTone(melody[noteIndex % melody.length] * speedBoost, 0.15, 'square', 0.025);
      noteIndex++;
    }
  }, 185);
}

const sfx = {
  flap: () => playTone(430, 0.11, 'square', 0.06),
  score: () => {
    playTone(987.77, 0.07, 'square', 0.06);
    setTimeout(() => playTone(1318.51, 0.15, 'square', 0.06), 70);
  },
  coin: (combo = 1) => {
    const pitch = Math.min(1800, 1100 + combo * 75);
    playTone(pitch, 0.07, 'square', 0.06);
    setTimeout(() => playTone(pitch * 1.25, 0.13, 'square', 0.06), 60);
  },
    fever: () => {
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.12, 'square', 0.08), i * 55);
    });
  },
  laser: () => playTone(920, 0.16, 'sawtooth', 0.08),
  explosion: () => playTone(105, 0.3, 'sawtooth', 0.11),
  dash: () => playTone(640, 0.15, 'triangle', 0.08),
  crash: () => playTone(125, 0.38, 'sawtooth', 0.11)
};

const musicBtn = document.getElementById('music-toggle');
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  initAudio();
  startRetroMusic();
  musicMuted = !musicMuted;
  musicBtn.textContent = musicMuted ? 'MUSIC: OFF' : 'MUSIC: ON';
});

window.addEventListener('pointerdown', () => { initAudio(); startRetroMusic(); }, { once: true });
window.addEventListener('keydown', () => { initAudio(); startRetroMusic(); }, { once: true });

// ==========================================
// 2. PLAYER SAVE DATA & UNLOCKABLE SKINS
// ==========================================
const SKINS = [
  { id: 'classic', name: 'CLASSIC',    color: '#facc15', cost: 0 },
  { id: 'cyber',   name: 'CYBER BLUE', color: '#38bdf8', cost: 15 },
  { id: 'crimson', name: 'CRIMSON',    color: '#ef4444', cost: 30 },
  { id: 'emerald', name: 'EMERALD',    color: '#4ade80', cost: 50 },
  { id: 'phantom', name: 'PHANTOM',    color: '#c084fc', cost: 80 },
  { id: 'gold',    name: '24K GOLD',   color: '#fbbf24', cost: 120 }
];

window.playerData = {
  bestScore: Number(localStorage.getItem('flappyBestScore')) || 0,
  coins: Number(localStorage.getItem('flappyCoins')) || 0,
  unlockedSkins: JSON.parse(localStorage.getItem('flappyUnlockedSkins')) || ['classic'],
  equippedSkin: localStorage.getItem('flappyEquippedSkin') || 'classic'
};

window.savePlayerProgress = function () {
  localStorage.setItem('flappyBestScore', window.playerData.bestScore);
  localStorage.setItem('flappyCoins', window.playerData.coins);
  localStorage.setItem('flappyUnlockedSkins', JSON.stringify(window.playerData.unlockedSkins));
  localStorage.setItem('flappyEquippedSkin', window.playerData.equippedSkin);
  window.updateCoinsUI();

  if (window.syncCloudProgress) {
    window.syncCloudProgress(window.playerData);
  }
};

window.updateCoinsUI = function () {
  document.getElementById('coin-badge').textContent = `COINS: ${window.playerData.coins}`;
};
window.updateCoinsUI();

function renderShop() {
  const grid = document.getElementById('skin-grid');
  grid.innerHTML = '';
  SKINS.forEach(skin => {
    const owned = window.playerData.unlockedSkins.includes(skin.id);
    const equipped = window.playerData.equippedSkin === skin.id;

    const div = document.createElement('div');
    div.className = `skin-item ${equipped ? 'equipped' : ''}`;
    div.innerHTML = `
      <div class="skin-swatch" style="background: ${skin.color};"></div>
      <div style="margin-bottom: 6px;">${skin.name}</div>
      <div style="color: ${owned ? '#16a34a' : '#f97316'};">
        ${equipped ? 'EQUIPPED' : owned ? 'EQUIP' : `${skin.cost} COINS`}
      </div>
    `;

    div.addEventListener('click', () => {
      if (owned) {
        window.playerData.equippedSkin = skin.id;
        sfx.coin(1);
      } else if (window.playerData.coins >= skin.cost) {
        window.playerData.coins -= skin.cost;
        window.playerData.unlockedSkins.push(skin.id);
        window.playerData.equippedSkin = skin.id;
        sfx.score();
      } else {
        sfx.crash();
      }
      window.savePlayerProgress();
      renderShop();
    });

    grid.appendChild(div);
  });
}

// ==========================================
// 3. REINVENTED GAMEPLAY ENGINE
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameState = 'DEMO';
let score = 0;
let runCoins = 0;
let coinCombo = 0;
let feverTimer = 0;
let shakeTimer = 0;
let frameCount = 0;

const bird = {
  x: 0,
  y: 0,
  size: 30,
  velocity: 0,
  gravity: 0.45,
  jumpStrength: -8.2,
  laserCooldown: 0,
  dashTimer: 0,
  dashCooldown: 0
};

let pipes = [];
let coins = [];
let lasers = [];
let particles = [];
let floatingTexts = [];

const pipeWidth = 74;
const pipeGap = 175;
const basePipeSpeed = 3.9;

function resetGame(mode) {
  gameState = mode;
  bird.x = Math.min(220, canvas.width * 0.25);
  bird.y = canvas.height * 0.45;
  bird.velocity = 0;
  bird.laserCooldown = 0;
  bird.dashTimer = 0;
  bird.dashCooldown = 0;
  pipes = [];
  coins = [];
  lasers = [];
  particles = [];
  floatingTexts = [];
  score = 0;
  runCoins = 0;
  coinCombo = 0;
  feverTimer = 0;
  shakeTimer = 0;
  frameCount = 0;
  document.getElementById('hud-score').textContent = '0';
}

function addFloatingText(x, y, text, color = '#fff') {
  floatingTexts.push({ x, y, text, color, life: 42 });
}

function spawnParticles(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 9,
      vy: (Math.random() - 0.5) * 9,
      size: 6,
      color,
      life: 26
    });
  }
}

function flap() {
  if (gameState !== 'PLAYING') return;
  bird.velocity = bird.jumpStrength;
  spawnParticles(bird.x, bird.y + bird.size, '#ffffff', 4);
  sfx.flap();
}

function shootLaser() {
  if (gameState !== 'PLAYING' || bird.laserCooldown > 0) return;
  lasers.push({ x: bird.x + bird.size, y: bird.y + bird.size / 2 - 4, width: 32, height: 8 });
  bird.laserCooldown = 75; // 1.25s cooldown
  sfx.laser();
}

function triggerDash() {
  if (gameState !== 'PLAYING' || bird.dashCooldown > 0) return;
  bird.dashTimer = 20;
  bird.dashCooldown = 160;
  bird.velocity = 0;
  shakeTimer = 6;
  spawnParticles(bird.x, bird.y + 15, '#38bdf8', 16);
  sfx.dash();
}

window.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    flap();
  } else if (e.code === 'KeyE' || e.code === 'Enter') {
    shootLaser();
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    triggerDash();
  }
});

canvas.addEventListener('pointerdown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (e.button === 2) shootLaser();
  else flap();
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function triggerGameOver() {
  gameState = 'GAMEOVER';
  shakeTimer = 14;
  sfx.crash();
  spawnParticles(bird.x + 15, bird.y + 15, '#facc15', 24);

  if (score > window.playerData.bestScore) {
    window.playerData.bestScore = score;
  }
  window.playerData.coins += runCoins;
  window.savePlayerProgress();

  document.getElementById('hud').classList.add('hidden');
  document.getElementById('controls-hint').classList.add('hidden');
  document.getElementById('final-score').textContent = score;
  document.getElementById('best-score').textContent = window.playerData.bestScore;
  document.getElementById('earned-coins').textContent = `+${runCoins}`;
  document.getElementById('gameover-screen').classList.remove('hidden');
}

function update() {
  frameCount++;

  if (bird.laserCooldown > 0) bird.laserCooldown--;
  if (bird.dashCooldown > 0) bird.dashCooldown--;
  if (bird.dashTimer > 0) bird.dashTimer--;
  if (feverTimer > 0) feverTimer--;
  if (shakeTimer > 0) shakeTimer--;

  if (gameState === 'PLAYING') {
    document.getElementById('hud-laser').textContent =
      bird.laserCooldown === 0 ? 'READY' : `${(bird.laserCooldown / 60).toFixed(1)}S`;
    document.getElementById('hud-dash').textContent =
      feverTimer > 0 ? 'FEVER!!' :
      bird.dashTimer > 0 ? 'ACTIVE!' :
      bird.dashCooldown === 0 ? 'READY' : `${(bird.dashCooldown / 60).toFixed(1)}S`;
  }

  // Demo AI pilot behind menu
  if (gameState === 'DEMO') {
    const nextPipe = pipes.find(p => p.x + pipeWidth > bird.x && !p.destroyed);
Use code with caution.
const targetY = nextPipe ? nextPipe.topHeight + pipeGap * 0.55 : canvas.height * 0.45;
if (bird.y > targetY && bird.velocity >= 0) {
bird.velocity = bird.jumpStrength * 0.85;
}
}
// Speed scales smoothly as score increases + Fever/Dash boosts
const difficultySpeed = Math.min(2.2, score * 0.04);
let currentSpeed = basePipeSpeed + difficultySpeed;
if (bird.dashTimer > 0 || feverTimer > 0) currentSpeed *= 1.85;
if (gameState === 'DEMO' || gameState === 'PLAYING') {
if (bird.dashTimer === 0) {
bird.velocity += bird.gravity;
bird.y += bird.velocity;
}
// Spawn Pipes & Coins
const spawnRate = Math.max(78, 100 - Math.floor(score * 0.3));
if (frameCount % spawnRate === 0) {
const minTop = 75;
const maxTop = canvas.height - pipeGap - 115;
const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
const isCracked = Math.random() < 0.38;
// Pipes start gently moving up/down once player reaches 8+ points!
const isMoving = score >= 8 && !isCracked && Math.random() < 0.45;
pipes.push({
x: canvas.width,
topHeight,
baseTop: topHeight,
moveOffset: Math.random() * Math.PI * 2,
isMoving,
passed: false,
isCracked,
destroyed: false
});
coins.push({
x: canvas.width + pipeWidth / 2,
y: topHeight + pipeGap / 2 + (Math.random() * 46 - 23),
size: 16,
collected: false,
missed: false
});
}
// Update Lasers
for (let i = lasers.length - 1; i >= 0; i--) {
const l = lasers[i];
l.x += 14;
pipes.forEach(p => {
if (!p.destroyed && l.x + l.width > p.x && l.x < p.x + pipeWidth) {
if (p.isCracked) {
p.destroyed = true;
score += 3;
shakeTimer = 8;
document.getElementById('hud-score').textContent = score;
addFloatingText(p.x, l.y - 10, '+3 BLAST!', '#fef08a');
spawnParticles(p.x + pipeWidth / 2, l.y, '#ef4444', 20);
sfx.explosion();
}
l.hit = true;
}
});
if (l.hit || l.x > canvas.width) lasers.splice(i, 1);
}
// Update Coins & Combo Streak
for (let i = coins.length - 1; i >= 0; i--) {
const c = coins[i];
c.x -= currentSpeed;
if (!c.collected &&
bird.x < c.x + c.size &&
bird.x + bird.size > c.x - c.size &&
bird.y < c.y + c.size &&
bird.y + bird.size > c.y - c.size) {
c.collected = true;
if (gameState === 'PLAYING') {
coinCombo++;
const bonus = feverTimer > 0 ? 2 : 1;
runCoins += bonus;
sfx.coin(coinCombo);
spawnParticles(c.x, c.y, '#facc15', 10);
if (coinCombo === 10 && feverTimer === 0) {
feverTimer = 300; // 5 seconds of unstoppable Fever Mode!
shakeTimer = 10;
sfx.fever();
addFloatingText(bird.x, bird.y - 25, 'FEVER MODE!!', '#facc15');
} else if (coinCombo > 1) {
addFloatingText(c.x, c.y - 15, x${coinCombo} COMBO!, '#fef08a');
}
}
}
// Reset combo if player misses a coin
if (!c.collected && !c.missed && c.x + c.size < bird.x) {
c.missed = true;
coinCombo = 0;
}
if (c.collected || c.x < -30) coins.splice(i, 1);
}
// Update Pipes & Collisions
for (let i = pipes.length - 1; i >= 0; i--) {
const p = pipes[i];
p.x -= currentSpeed;
if (p.isMoving) {
p.topHeight = p.baseTop + Math.sin(frameCount * 0.04 + p.moveOffset) * 38;
}
if (!p.passed && p.x + pipeWidth < bird.x) {
p.passed = true;
if (gameState === 'PLAYING') {
score += feverTimer > 0 ? 2 : 1;
document.getElementById('hud-score').textContent = score;
sfx.score();
}
}
if (!p.destroyed) {
const hitPipeX = bird.x + bird.size > p.x && bird.x < p.x + pipeWidth;
const hitPipeY = bird.y < p.topHeight || bird.y + bird.size > p.topHeight + pipeGap;
if (hitPipeX && hitPipeY) {
// Fever Mode smashes right through ANY pipe!
if (feverTimer > 0) {
p.destroyed = true;
score += 2;
shakeTimer = 8;
document.getElementById('hud-score').textContent = score;
spawnParticles(p.x + pipeWidth / 2, bird.y, '#facc15', 22);
sfx.explosion();
} else if (bird.dashTimer === 0) {
if (gameState === 'PLAYING') return triggerGameOver();
if (gameState === 'DEMO') return resetGame('DEMO');
}
}
}
if (p.x + pipeWidth < 0) pipes.splice(i, 1);
}
// Floor & Ceiling Check
const groundY = canvas.height - 48;
if (bird.y + bird.size >= groundY || bird.y <= 0) {
if (gameState === 'PLAYING') return triggerGameOver();
if (gameState === 'DEMO') {
bird.y = canvas.height * 0.45;
bird.velocity = 0;
}
}
}
// Update Particles & Floating Text
for (let i = particles.length - 1; i >= 0; i--) {
const pt = particles[i];
pt.x += pt.vx;
pt.y += pt.vy;
pt.life--;
if (pt.life <= 0) particles.splice(i, 1);
}
for (let i = floatingTexts.length - 1; i >= 0; i--) {
const ft = floatingTexts[i];
ft.y -= 1.2;
ft.life--;
if (ft.life <= 0) floatingTexts.splice(i, 1);
}
}
function draw() {
ctx.save();
// Retro Screen Shake
if (shakeTimer > 0) {
const dx = (Math.random() - 0.5) * 10;
const dy = (Math.random() - 0.5) * 10;
ctx.translate(dx, dy);
}
// Sky (shifts to warm sunset tint during Fever Mode!)
ctx.fillStyle = feverTimer > 0 ? '#f97316' : '#38bdf8';
ctx.fillRect(0, 0, canvas.width, canvas.height);
// Retro Clouds
ctx.fillStyle = feverTimer > 0 ? '#fed7aa' : '#e0f2fe';
for (let i = 0; i < 5; i++) {
const cx = ((i * 340 - frameCount * 0.4) % (canvas.width + 200));
const drawX = cx < -120 ? cx + canvas.width + 200 : cx;
ctx.fillRect(drawX, 90 + (i % 2) * 50, 96, 24);
ctx.fillRect(drawX + 16, 74 + (i % 2) * 50, 64, 16);
}
// City Skyline
ctx.fillStyle = feverTimer > 0 ? '#fb923c' : '#7dd3fc';
for (let x = 0; x < canvas.width; x += 90) {
const h = 90 + ((x * 13) % 70);
ctx.fillRect(x, canvas.height - 48 - h, 75, h);
}
// Pipes
pipes.forEach(p => {
if (p.destroyed) return;
ctx.fillStyle = p.isCracked ? '#ef4444' : p.isMoving ? '#a855f7' : '#22c55e';
ctx.strokeStyle = '#000000';
ctx.lineWidth = 4;
ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
ctx.strokeRect(p.x, -2, pipeWidth, p.topHeight + 2);
ctx.fillRect(p.x - 6, p.topHeight - 24, pipeWidth + 12, 24);
ctx.strokeRect(p.x - 6, p.topHeight - 24, pipeWidth + 12, 24);
const bottomY = p.topHeight + pipeGap;
const bottomH = canvas.height - 48 - bottomY;
ctx.fillRect(p.x, bottomY, pipeWidth, bottomH);
ctx.strokeRect(p.x, bottomY, pipeWidth, bottomH);
ctx.fillRect(p.x - 6, bottomY, pipeWidth + 12, 24);
ctx.strokeRect(p.x - 6, bottomY, pipeWidth + 12, 24);
if (p.isCracked) {
ctx.fillStyle = '#fef08a';
ctx.fillRect(p.x + 20, p.topHeight - 60, 8, 20);
ctx.fillRect(p.x + 28, p.topHeight - 45, 8, 18);
ctx.fillRect(p.x + 22, bottomY + 35, 8, 22);
}
});
// Coins
coins.forEach(c => {
ctx.fillStyle = '#facc15';
ctx.strokeStyle = '#000';
ctx.lineWidth = 3;
ctx.fillRect(c.x - 8, c.y - 10, 16, 20);
ctx.strokeRect(c.x - 8, c.y - 10, 16, 20);
ctx.fillStyle = '#fef9c3';
ctx.fillRect(c.x - 3, c.y - 5, 4, 10);
});
// Lasers
lasers.forEach(l => {
ctx.fillStyle = '#ef4444';
ctx.fillRect(l.x, l.y, l.width, l.height);
ctx.fillStyle = '#fef08a';
ctx.fillRect(l.x + 4, l.y + 2, l.width - 8, l.height - 4);
});
// Ground
const groundY = canvas.height - 48;
ctx.fillStyle = '#eab308';
ctx.fillRect(0, groundY, canvas.width, 48);
ctx.fillStyle = '#16a34a';
ctx.fillRect(0, groundY, canvas.width, 14);
ctx.strokeStyle = '#000';
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(0, groundY);
ctx.lineTo(canvas.width, groundY);
ctx.stroke();
// Bird (Rainbow flash during Fever Mode!)
const activeSkin = SKINS.find(s => s.id === window.playerData.equippedSkin) || SKINS;
const rainbowColors = ['#ef4444', '#facc15', '#4ade80', '#38bdf8', '#c084fc'];
ctx.fillStyle = feverTimer > 0
? rainbowColors[Math.floor(frameCount / 4) % rainbowColors.length]
: bird.dashTimer > 0 ? '#ffffff' : activeSkin.color;
ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
ctx.strokeStyle = '#000000';
ctx.lineWidth = 4;
ctx.strokeRect(bird.x, bird.y, bird.size, bird.size);
// Wing, Eye & Beak
ctx.fillStyle = 'rgba(255,255,255,0.5)';
ctx.fillRect(bird.x + 4, bird.y + 12, 12, 8);
ctx.fillStyle = '#ffffff';
ctx.fillRect(bird.x + 18, bird.y + 4, 8, 8);
ctx.fillStyle = '#000000';
ctx.fillRect(bird.x + 22, bird.y + 6, 4, 4);
ctx.fillStyle = '#f97316';
ctx.fillRect(bird.x + 26, bird.y + 15, 10, 8);
ctx.strokeRect(bird.x + 26, bird.y + 15, 10, 8);
// Particles
particles.forEach(pt => {
ctx.fillStyle = pt.color;
ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
});
// Floating Combo / Blast Text
ctx.font = '12px "Press Start 2P", monospace';
floatingTexts.forEach(ft => {
ctx.fillStyle = '#000';
ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
ctx.fillStyle = ft.color;
ctx.fillText(ft.text, ft.x, ft.y);
});
ctx.restore();
}
function gameLoop() {
update();
draw();
requestAnimationFrame(gameLoop);
}
resetGame('DEMO');
gameLoop();
// ==========================================
// 4. MENU & MODAL NAVIGATION
// ==========================================
const loadingScreen = document.getElementById('loading-screen');
const menuScreen = document.getElementById('menu-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const hud = document.getElementById('hud');
const controlsHint = document.getElementById('controls-hint');
window.addEventListener('load', () => {
setTimeout(() => {
loadingScreen.classList.add('swiped-up');
menuScreen.classList.remove('swiped-up');
}, 1700);
});
document.getElementById('play-btn').addEventListener('click', () => {
initAudio();
startRetroMusic();
menuScreen.classList.add('swiped-up');
hud.classList.remove('hidden');
controlsHint.classList.remove('hidden');
resetGame('PLAYING');
flap();
});
document.getElementById('restart-btn').addEventListener('click', () => {
gameoverScreen.classList.add('hidden');
hud.classList.remove('hidden');
controlsHint.classList.remove('hidden');
resetGame('PLAYING');
flap();
});
document.getElementById('menu-return-btn').addEventListener('click', () => {
gameoverScreen.classList.add('hidden');
menuScreen.classList.remove('swiped-up');
resetGame('DEMO');
});
document.getElementById('shop-btn').addEventListener('click', () => {
renderShop();
document.getElementById('shop-modal').classList.remove('hidden');
});
document.getElementById('account-btn').addEventListener('click', () => {
document.getElementById('account-modal').classList.remove('hidden');
});
document.getElementById('leaderboard-btn').addEventListener('click', () => {
document.getElementById('leaderboard-modal').classList.remove('hidden');
if (window.loadGlobalLeaderboard) window.loadGlobalLeaderboard();
});
document.querySelectorAll('.close-modal-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
});
});
