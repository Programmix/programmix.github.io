
class Cache extends Array {

  constructor(maxLength) {
    super();

    this.maxLength = maxLength;
  }

  push(...args) {
    super.push(...args);

    if (this.length > this.maxLength) this.shift();
  }

}

class Vector {

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  normalizeArgs(a, b) {
    if (a instanceof Vector) return { a: a.x, b: a.y };
    if (a && !b) return { a: a, b: a };
    return { a, b };
  }

  set(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  add(...args) {
    const { a, b } = this.normalizeArgs(...args);

    this.x += a;
    this.y += b || a;

    return this;
  }

  subtract(...args) {
    const { a, b } = this.normalizeArgs(...args);

    this.x -= a;
    this.y -= b || a;

    return this;
  }

  multiply(...args) {
    const { a, b } = this.normalizeArgs(...args);

    this.x *= a;
    this.y *= b || a;

    return this;
  }

  divide(...args) {
    const { a, b } = this.normalizeArgs(...args);

    this.x /= a;
    this.y /= b || a;

    return this;
  }

}
