
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
