
var width, height;
var scale = 15;

const PI = Math.PI;
const TAU = PI * 2;

let container, debug, audio;

class Main {

  constructor() {
    this.canvas = new Two({
      type: Two.Types.canvas,
      autostart: true,
      fullscreen: true
    }).appendTo(container);

    this.audioCtx = new AudioContext();
    this.audioSrc = this.audioCtx.createMediaElementSource(audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.audioSrc.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.controls = new Controls(audio);

    width = this.canvas.width;
    height = this.canvas.height;

    this.setup();

    this.canvas.bind('update', this.render.bind(this));
  }

  setup() {
    this.fps = 0;

    this.cols = Math.floor(width / scale);
    this.rows = Math.floor(height / scale);

    this.flowField = new Array(this.cols * this.rows)
      .fill(new Two.Vector(0, 0));

    this.particles = [];

    for (let p = 0; p < 100; p++) {
      const particle = new Particle(this);
      this.particles.push(particle);
    }

    // audio
    this.vol = 0;
    this.volRange = 0;
    this.volDiff = 0;

    this.volCache = new Cache(60 * 2);
    this.volDiffCache = new Cache(60);
  }

  render(frameCount) {
    const canvas = this.canvas;

    if (frameCount % 5 == 0)
      this.fps = Math.floor((1 / canvas.timeDelta) * 1000);

    canvas.clear();

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

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const z = Math.sin(Date.now() * 0.005);
        const r = (noise.perlin3(x / scale, y / scale, z) * 0.35);
        const a = r * PI - 0.1;

        const v = new Two.Vector(Math.cos(a) * scale, Math.sin(a) * scale);

        this.flowField[x + y * this.cols] = v;

        const sx = x * scale;
        const sy = y * scale;
        //canvas.makeLine(sx, sy, sx + v.x, sy + v.y);
      }
    }

    const pfactor = (volDiff - volDiffRange) * 3 + 1;

    for (const particle of this.particles) {
      particle.size = 2 + (vol * 0.75) + ((Math.abs(pfactor) * 2.5) ^ 2) * 1.5;
      particle.speedOffset = (vol * 0.35) + (pfactor * 1.25) ^ 2;

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
