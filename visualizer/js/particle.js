
class Particle {

  constructor(main) {
    this.main = main;
    this.canvas = main.canvas;
    this.ctx = main.ctx;
    this.flowField = main.flowField;

    this.pos = new Vector(this.rand(width), height * 0.9);
    this.acc = new Vector(0, 0);
    this.vel = new Vector(0, 0);

    this.friction = 0.5;
    this.size = 10;
    this.speedOffset = 0;

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
    this.acc.add(force);
  }

  update() {
    this.follow();

    this.acc.multiply(1 + Math.random() * 0.1); // add minute random force
    this.vel.add(this.acc.clone().multiply(1 + this.speedOffset + this.size * 0.25));
    this.vel.divide(this.friction + 1);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  follow() {
    this.clamp();

    const { x: px, y: py } = this.pos;
    const x = Math.floor(px / scale);
    const y = Math.floor(py / scale);

    const v = this.flowField[x + y * this.main.cols];
    if (!v) {
      this.accelerate(new Vector(0, this.rand(2) - 1));
      return;
    }

    this.accelerate(v.clone().multiply(0.1));
  }

  clamp() {
    const pos = this.pos;

    if (pos.x < 0 || pos.x > width)
      pos.set(0, ((height - (this.main.vol * height * 0.05)) + this.rand(height * 0.05) - this.rand(height * 0.025)));

    if (pos.y < 0 || pos.y > height - 16)
      pos.set(pos.x, Math.max(0, Math.min(height - 16, pos.y)));
  }

  render() {
    const ctx = this.ctx;
    let { x, y } = this.pos;
    x = Math.floor(x);
    y = Math.floor(y);

    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, TAU, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

}
