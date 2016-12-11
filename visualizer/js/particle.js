
class Particle {

  constructor(main) {
    this.main = main;
    this.canvas = main.canvas;
    this.flowField = main.flowField;

    this.pos = new Two.Vector(this.rand(width), height * 0.9);
    this.acc = new Two.Vector(0, 0);
    this.vel = new Two.Vector(0, 0);

    this.friction = 0.5;
    this.size = 10;
    this.speedOffset = Math.random() * 0.02;

    this.color = "#FFFFFF";
  }

  randColor() {
    const base = 50;
    const random = 255 - base;

    const r = (Math.round(Math.random() * random) + base).toString(16);
    const g = (Math.round(Math.random() * random) + base).toString(16);
    const b = (Math.round(Math.random() * random) + base).toString(16);
    return '#' + r + g + b;
  }

  rand(n) {
    return Math.floor(Math.random() * n);
  }

  accelerate(force) {
    this.acc.addSelf(force);
  }

  update() {
    this.follow();

    this.vel.addSelf(this.acc.clone().multiplyScalar(1 + this.speedOffset + this.size * 0.25));
    this.vel.multiplyScalar(1 / (this.friction + 1));
    this.pos.addSelf(this.vel);
    this.acc.set(0, 0);
  }

  follow() {
    this.clamp();

    const { x: px, y: py } = this.pos;
    const x = Math.floor(px / scale);
    const y = Math.floor(py / scale);

    const v = this.flowField[x + y * this.main.cols];
    if (!v) {
      this.accelerate(new Two.Vector(0, this.rand(2) - 1));
      return;
    }

    this.accelerate(v.clone().multiplyScalar(0.1));
  }

  clamp() {
    const pos = this.pos;

    if (pos.x < 0 || pos.x > width)
      pos.set(0, ((height - (this.main.volDiff * height * 0.1)) + this.rand(height * 0.05) - this.rand(height * 0.025)));

    if (pos.y < 0 || pos.y > height - 16)
      pos.set(pos.x, Math.max(0, Math.min(height - 16, pos.y)));
  }

  render() {
    const canvas = this.canvas;
    let { x, y } = this.pos;
    x = Math.floor(x);
    y = Math.floor(y);

    const circle = canvas.makeCircle(x, y, this.size);
    circle.fill = this.color;
    circle.noStroke();
  }

}
