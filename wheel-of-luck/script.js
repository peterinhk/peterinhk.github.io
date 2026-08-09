// script.js - Wheel of Luck functionality

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const addItemBtn = document.getElementById('addItemBtn');
const newItemInput = document.getElementById('newItem');
const itemsUl = document.getElementById('itemsUl');

// Fireworks canvas
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas.getContext('2d');
let fireworks = [];
let fireworksRunning = false;
let fireworksAnimationId = null;

// Fisher-Yates shuffle using crypto.getRandomValues for better randomness
function shuffleArray(array) {
  const arr = [...array];
  const randomValues = new Uint32Array(arr.length);
  crypto.getRandomValues(randomValues);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Initialize items BEFORE calling any functions that use it
// Check for custom items from query parameter
const defaultItems = ['John', 'Peter', 'Arnelio', 'Michael', 'Joseph'];
let items = window.customItems && window.customItems.length > 0 
  ? shuffleArray(window.customItems) 
  : shuffleArray(defaultItems);
let rotation = 0; // in radians
let angularVelocity = 0; // radians per second
let spinning = false;

// Colors for wheel segments (cycling)
//const colors = ['#FFB74D', '#4FC3F7', '#81C784', '#F06292', '#BA68C8', '#FFD54F', '#A1887F'];
const colors = ['#F04F24', '#EA0A8C', '#75C043', '#FDB715', '#2AACE2', '#4DB1C9','#939598', '#897F9C', '#B06767', '#759143', '#DCAD27' ];

function resizeFireworksCanvas() {
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
resizeFireworksCanvas();
window.addEventListener('resize', resizeFireworksCanvas);

// Responsive wheel canvas
function resizeWheelCanvas() {
  const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 500);
  const size = Math.max(maxSize, 280);
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  drawWheel();
}
resizeWheelCanvas();
window.addEventListener('resize', resizeWheelCanvas);
window.addEventListener('orientationchange', () => {
  setTimeout(resizeWheelCanvas, 100);
});

class Firework {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * fwCanvas.width;
    this.y = fwCanvas.height;
    this.targetY = Math.random() * fwCanvas.height * 0.5;
    this.speed = 4 + Math.random() * 4;
    this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.exploded = false;
    this.particles = [];
    this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    this.trail = [];
  }
  update() {
    if (!this.exploded) {
      this.trail.push({x: this.x, y: this.y});
      if (this.trail.length > 8) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05; // gravity
      if (this.y <= this.targetY || this.vy >= 0) {
        this.explode();
      }
    } else {
      this.particles.forEach(p => {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.1;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.01;
      });
      this.particles = this.particles.filter(p => p.alpha > 0);
    }
  }
  explode() {
    this.exploded = true;
    console.log('Firework exploded at', this.x, this.y);
    const count = 50 + Math.random() * 30;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: this.color,
        size: 2 + Math.random() * 3
      });
    }
  }
  draw() {
    if (!this.exploded) {
      // trail
      fwCtx.strokeStyle = this.color;
      fwCtx.lineWidth = 3;
      fwCtx.lineCap = 'round';
      fwCtx.beginPath();
      fwCtx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        fwCtx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      fwCtx.stroke();
      // head
      fwCtx.fillStyle = this.color;
      fwCtx.beginPath();
      fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      fwCtx.fill();
    } else {
      this.particles.forEach(p => {
        fwCtx.globalAlpha = p.alpha;
        fwCtx.fillStyle = p.color;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fwCtx.fill();
      });
      fwCtx.globalAlpha = 1;
    }
  }
  isDead() {
    return this.exploded && this.particles.length === 0;
  }
}

function startFireworks() {
  stopFireworks();
  fireworksRunning = true;
  fwCanvas.classList.add('active');
  fireworks = [new Firework()];
  function loop() {
    if (!fireworksRunning) return;
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    // spawn new fireworks occasionally
    if (Math.random() < 0.03 && fireworks.filter(f => !f.exploded).length < 3) {
      fireworks.push(new Firework());
    }
    fireworks.forEach(f => {
      f.update();
      f.draw();
    });
    fireworks = fireworks.filter(f => !f.isDead());
    fireworksAnimationId = requestAnimationFrame(loop);
  }
  loop();
}

function stopFireworks() {
  fireworksRunning = false;
  if (fireworksAnimationId) {
    cancelAnimationFrame(fireworksAnimationId);
    fireworksAnimationId = null;
  }
  fireworks = [];
  fwCanvas.classList.remove('active');
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
}

// Initialize UI with defaults
updateItemList();
drawWheel();

function drawWheel() {
  const { width, height } = canvas;
  const fullRadius = Math.min(width, height) / 2;
  const radius = fullRadius;
  ctx.clearRect(0, 0, width, height);
  if (items.length === 0) {
    // Empty wheel placeholder
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    ctx.fill();
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, fullRadius - 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add items to spin', width / 2, height / 2);
    return;
  }
  const segmentAngle = (2 * Math.PI) / items.length;
  for (let i = 0; i < items.length; i++) {
    const startAngle = rotation + i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(width / 2, height / 2, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    // Draw text
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = '28px "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(items[i], radius - 27, 0);
    ctx.restore();
  }
  // Draw border on edge of wedges
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, fullRadius - 2, 0, 2 * Math.PI);
  ctx.stroke();
}

function updateItemList() {
  itemsUl.innerHTML = '';
  items.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.textContent = item;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      items.splice(idx, 1);
      updateItemList();
      drawWheel();
    };
    li.appendChild(delBtn);
    itemsUl.appendChild(li);
  });
}

function addItem() {
  const val = newItemInput.value.trim();
  if (val) {
    items.push(val);
    newItemInput.value = '';
    updateItemList();
    drawWheel();
  }
}

addItemBtn.onclick = addItem;
newItemInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addItem();
});

let spinStartTime = 0;
// 1000 RPM ≈ 104.72 rad/s
const TARGET_RPM = 1000;
const TARGET_RAD_PER_SEC = TARGET_RPM * 2 * Math.PI / 60;

function spinWheel() {
  // Stop any existing fireworks
  stopFireworks();
  if (items.length === 0) return;
  
  // Shuffle items on each spin for additional randomness
  items = shuffleArray(items);
  
  // Add random initial offset to make it less predictable
  const randomOffset = Math.random() * 2 * Math.PI;
  rotation += randomOffset;
  
  // Randomize RPM slightly (950-1050 RPM)
  const rpmVariation = 950 + Math.random() * 100;
  const targetRadPerSec = rpmVariation * 2 * Math.PI / 60;
  angularVelocity = targetRadPerSec;
  
  if (!spinning) {
    spinning = true;
    spinStartTime = performance.now();
    requestAnimationFrame(animateSpin);
  }
}

function animateSpin(now) {
  const delta = (now - spinStartTime) / 1000; // seconds since last frame
  spinStartTime = now;
  // update rotation
  rotation += angularVelocity * delta;
  // apply friction decay (quarter friction)
  angularVelocity *= 0.98; // decay factor per frame
  drawWheel();
  if (angularVelocity > 0.05) {
    requestAnimationFrame(animateSpin);
  } else {
    spinning = false;
    angularVelocity = 0;
    // determine landed segment based on final rotation
    const normalized = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const segmentAngle = (2 * Math.PI) / items.length;
    const index = Math.floor(((Math.PI * 1.5) - normalized) / segmentAngle) % items.length;
    const landedIdx = (index + items.length) % items.length;
    const resultDiv = document.getElementById('resultDisplay');
    const resultEl = document.getElementById('tributeText');
    resultEl.textContent = items[landedIdx];
    resultDiv.classList.add('show');
    // Start fireworks
    startFireworks();
  }
}

spinBtn.onclick = spinWheel;

// Initial render
drawWheel();