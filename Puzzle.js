const numberOrDefault = (value, defaultValue) =>
  isNaN(value) ? defaultValue : value;

class Puzzle {
  constructor({ width, height, rows, cols, lockedToPlayer, domain }) {
    this.rows = numberOrDefault(rows, 1);
    this.cols = numberOrDefault(cols, 1);
    this.width = numberOrDefault(width, 100);
    this.height = numberOrDefault(height, 100);
    this.domain = Array.isArray(domain) ? domain : [1, 2];
    //fixed: { 1: { 1: 1 } }
    this.lockedToPlayer =
      typeof lockedToPlayer === "object" ? lockedToPlayer : {};
    let hueSeed = Math.random();
    this.blocks = Array(this.cols)
      .fill()
      .flatMap((_, col) =>
        Array(this.rows)
          .fill()
          .map((_, row) => {
            let i = col + row * this.cols;
            let updating = true;
            let isLockedToPlayer = false;

            let lockedIndex = this.lockedToPlayer[`${col},${row}`];
            if (lockedIndex !== undefined && lockedIndex !== null) {
              if (0 <= lockedIndex && lockedIndex < this.domain.length) {
                i = lockedIndex;
                updating = false;
                isLockedToPlayer = true;
              } else {
                i = 0;
                updating = false;
              }
            }

            return new NumberBlock({
              domain: this.domain,
              hueSeed,
              updating,
              lockedToPlayer: isLockedToPlayer,
              row,
              col,
              i,
              x: col * (this.width / this.cols),
              y: row * (this.height / this.rows),
              w: this.width / this.cols,
              h: this.height / this.rows,
            });
          })
      );

    this.spec = Object.fromEntries(
      ["width", "cols", "height", "rows", "nMax", "lockedToPlayer"].map((k) => [
        k,
        this[k],
      ])
    );
  }

  setup() {
    console.log("setup", this);
    for (let b of this.blocks) {
      b.updating = !b.lockedToPlayer;
    }
  }
  deviceShaken() {
    for (let b of this.blocks) {
      if (b.updating) {
        continue;
      }
      b.deviceShaken();
    }
  }
  winConditionMet() {
    return this.tryGetWin() !== undefined;
  }

  winAnimation() {}
  welcomeAnimation() {}
  tryGetWin() {
    for (let b of this.blocks) {
      if (b.updating) {
        return undefined;
      }
    }
    let finalSet = new Set(this.blocks.map((b) => b.i));
    if (finalSet.size !== 1) {
      return undefined;
    }
    return { number: Array.from(finalSet)[0] + 1 };
  }
}

Puzzle.nullObject = () => new Puzzle({});
Puzzle.nullObject;
