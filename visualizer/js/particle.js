
class Particle {

  constructor(main, bg) {
    this.main = main;
    this.canvas = main.canvas;
    this.ctx = main.ctx;
    this.flowField = main.flowField;

    this.bg = bg;

    this.pos = new Vector(this.rand(width), !bg ? height * 0.75 : this.rand(height));
    this.acc = new Vector(0, 0);
    this.vel = new Vector(0, 0);

    this.friction = 0.5;
    this.size = 2;
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

    this.acc.multiply(1 + Math.random() * 0.2); // add minute random force
    this.vel.add(this.acc.clone().multiply(1 + this.speedOffset + this.size * 0.25));
    this.vel.divide(this.friction + 1);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  follow() {
    this.clamp();

    const { x: px, y: py } = this.pos;
    const x = Math.max(0, Math.min(Math.floor(px / scale), this.main.cols - 1));
    const y = Math.max(0, Math.min(Math.floor(py / scale), this.main.rows - 1));

    const v = this.flowField[x + y * this.main.cols];

    this.accelerate(v.clone().multiply(0.1));
  }

  clamp() {
    const pos = this.pos;

    if (pos.x < 0 || pos.x > width) {
      pos.set(0, this.calcSpawnY());
      this.accelerate(this.calcSpawnAngle());
    }

    if (pos.y < 0 || pos.y > height - 16)
      pos.set(pos.x, Math.max(0, Math.min(height - 16, pos.y)));
  }

  calcSpawnY() {
    const y = !this.bg ?
      (height * 0.75 - (this.main.volDiff * height * 0.1))
      : this.rand(height);
    const random = this.rand(height * 0.05) - this.rand(height * 0.025);

    return y + random;
  }

  calcSpawnAngle() {
    const angle = ((Math.random() * HALF_PI) * HALF_PI);
    const force = 5;

    return new Vector(Math.cos(angle) * force, Math.sin(angle) * force);
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
