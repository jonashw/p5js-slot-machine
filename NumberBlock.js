const boolOrDefault = (value, defaultValue) =>
  value === undefined || value === null ? defaultValue : !!value;

const stringOrDefault = (value, defaultValue) =>
  value === undefined || value === null ? defaultValue : !!value;

const invertHSL = (() => {
  let cache = {};
  return ([h, s, l]) => {
    if (h in cache && s in cache[h] && l in cache[h][s]) {
      return cache[h][s][l];
    } else {
      let hsl = [(h + 50) % 100, s, l];
      console.log({ original: [h, s, l], inverted: hsl });
      cache[h] = cache[h] || {};
      cache[h][s] = cache[h][s] || {};
      cache[h][s][l] = hsl;
      return hsl;
    }
  };
})();

class NumberBlock {
  constructor({
    w,
    h,
    x,
    y,
    i,
    updating,
    lockedToPlayer,
    row,
    col,
    hueSeed,
    domain,
  }) {
    this.i = isNaN(i) ? 0 : i;
    this.w = isNaN(w) ? 250 : w;
    this.h = isNaN(h) ? 250 : h;
    this.x = isNaN(x) ? 50 : x;
    this.y = isNaN(y) ? 50 : y;
    this.domain = domain;
    this.lockedToPlayer = isNaN(lockedToPlayer) ? 0 : lockedToPlayer;
    this.updating = boolOrDefault(updating, !this.lockedToPlayer);
    this.row = isNaN(row) ? 0 : row;
    this.col = isNaN(col) ? 0 : col;
    this.hueSeed = isNaN(hueSeed) ? 1 : hueSeed;
  }

  mouseClicked() {
    if (this.lockedToPlayer) {
      return;
    }
    this.updating = !this.updating;
    if (this.updating) {
      this.i = this.#nextIndex();
    }
    
  }

  containsPoint(x, y) {
    return (
      this.x <= x && this.y <= y && x <= this.x + this.w && y <= this.y + this.h
    );
  }
  draw() {
    let { x, y, w, h, i, hueSeed } = this;

    let hue = (hueSeed * (i / this.domain.length) * 100) % 100;
    let color = [hue, 70, 90];
    noStroke();
    fill(color);
    rect(x, y, w, h);
    let colorInverted = invertHSL(color);
    //colorInverted[1]=100;
    //colorInverted[2]=70;
    if (this.lockedToPlayer) {
      let d = Math.min(w, h) * 0.85;
      fill(colorInverted);
      circle(x + w / 2, y + h / 2, 1.0 * d);
      fill(color);
      circle(x + w / 2, y + h / 2, 0.95 * d);
    } else {
    }
    fill(colorInverted);
    strokeWeight(5);

    textStyle(BOLD);
    textSize((Math.min(w, h) * 140) / 250);

    //let tw = textWidth(this.label);
    //let th = textAscent() + textDescent();
    textAlign(CENTER, CENTER);
    textAlign();
    text(this.label, x + w / 2, y + h / 2);
  }
  get label() {
    return this.domain[this.i % this.domain.length];
  }
  #nextIndex() {
    return (this.i + 1) % this.domain.length;
  }
  #randomIndex() {
    return Math.floor(Math.random() * this.domain.length);
  }
  update() {
    if (!this.updating) {
      return;
    }
    this.i = this.#nextIndex();
  }
  deviceShaken() {
    if (this.lockedToPlayer) {
      return;
    }
    if (this.updating) {
      return;
    }
    this.i = this.#randomIndex();
  }
}
