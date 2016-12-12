
var width, height;
var scale = 25;

const FPS = 60;

const PI = Math.PI;
const HALF_PI = Math.PI * 0.5;
const QUARTER_PI = HALF_PI * 0.5;
const TAU = PI * 2;

let container, debug, audio;

class Main {

  constructor() {
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);
    this.resize();
    this.ctx = this.canvas.getContext('2d');

    document.body.addEventListener('resize', this.resize.bind(this));

    this.audioCtx = new AudioContext();
    this.audioSrc = this.audioCtx.createMediaElementSource(audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.audioSrc.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.controls = new Controls(audio);

    this.setup();

    this.lastFrame = Date.now();
    this.frameCount = 0;

    requestAnimationFrame(this.update.bind(this));
  }

  resize() {
    const canvas = this.canvas;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
  }

  setup() {
    this.fps = 0;

    this.cols = Math.floor(width / scale);
    this.rows = Math.floor(height / scale);

    this.flowField = new Array(this.cols * this.rows)
      .fill(new Vector(0, 0));

    this.particles = [];

    for (let p = 0; p < 250; p++) {
      const particle = new Particle(this);
      this.particles.push(particle);
    }

    for (let p = 0; p < 250; p++) {
      const particle = new Particle(this, true);
      this.particles.push(particle);
    }

    // audio
    this.vol = 0;
    this.volRange = 0;
    this.volDiff = 0;

    this.volCache = new Cache(60 * 2);
    this.volDiffCache = new Cache(60);
  }

  clear() {
    this.ctx.clearRect(0, 0, width, height);
  }

  update() {
    this.render(++this.frameCount);
    requestAnimationFrame(this.update.bind(this));
  }

  render(frameCount) {
    const canvas = this.canvas;

    this.timeDelta = Date.now() - this.lastFrame;
    this.lastFrame = Date.now();

    if (frameCount % 5 == 0)
      this.fps = Math.floor((1 / this.timeDelta) * 1000);

    this.clear();

    let frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    const totalVol = frequencyData.reduce((p, c) => p + c, 0);
    const freqAvg = totalVol / frequencyData.length;

    this.vol = totalVol * 0.0001;
    this.volCache.push(this.vol - 0.5);
    this.volRange = this.volCache.reduce((p, c) => p + c, 0) / this.volCache.length;
    this.volDiff = this.vol - this.volRange;
    this.volDiffCache.push(this.volDiff);
    this.volDiffRange = this.volDiffCache.reduce((p, c) => p + c, 0) / this.volDiffCache.length;

    const { vol, volRange, volDiff, volDiffRange } = this;

    const ctx = this.ctx;

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const z = Math.sin(frameCount * 0.05);
        const r = (noise.perlin3(x / scale, y / scale, z) * 0.35);
        const a = r * PI - 0.1;

        const v = new Vector(Math.cos(a) * scale, Math.sin(a) * scale);

        this.flowField[x + y * this.cols] = v;

        const sx = x * scale;
        const sy = y * scale;

        /*ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + v.x, sy + v.y);
        ctx.stroke();
        ctx.closePath();*/
      }
    }

    const pfactor = (volDiff - volDiffRange) * 3 + 1;

    for (const particle of this.particles) {
      if (!particle.bg) {
        particle.size = 2 + (vol * 0.75) + ((Math.abs(pfactor) * 2.5) ^ 2) * 1.5;
        particle.speedOffset = (vol * 0.35) + (pfactor * 1.25) ^ 2;
      }

      particle.update();
      particle.render();
    }

    debug.innerHTML =
    `
    fps: ${this.fps}<br>
    frq: ${freqAvg.toFixed(2)}<br>
    vol: ${vol.toFixed(2)}<br>
    rng: ${volRange.toFixed(2)}<br>
    dif: ${volDiff.toFixed(2)}<br>
    drg: ${volDiffRange.toFixed(2)}<br>
    pfc: ${pfactor.toFixed(2)}
    `
  }

}


document.addEventListener('DOMContentLoaded', () => {
  container = document.getElementById('container');
  debug = document.getElementById('debug');
  audio = document.getElementById('audio');

  new Main();
});
