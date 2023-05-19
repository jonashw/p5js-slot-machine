const numberOrDefault = (value, defaultValue) =>
  isNaN(value) ? defaultValue : value;

let narratorsByLanguage = {
  Arabic: ["Zeina"],
  "Australian English": ["Russell", "Nicole"],
  "Brazilian Portuguese": ["Vitoria", "Camila", "Ricardo"],
  "British English": ["Emma", "Brian", "Amy"],
  "Canadian French": ["Chantal"],
  "Castilian Spanish": ["Conchita", "Lucia", "Enrique"],
  "Chinese Mandarin": ["Zhiyu"],
  Danish: ["Naja", "Mads"],
  Dutch: ["Ruben", "Lotte"],
  French: ["Celine", "Lea", "Mathieu"],
  German: ["Hans", "Vicki", "Marlene"],
  Icelandic: ["Dora", "Karl"],
  "Indian English": ["Aditi", "Raveena"],
  Italian: ["Bianca", "Carla", "Giorgio"],
  Japanese: ["Takumi", "Mizuki"],
  Korean: ["Seoyeon"],
  "Mexican Spanish": ["Mia"],
  Norwegian: ["Liv"],
  Polish: ["Jacek", "Jan", "Maja", "Ewa"],
  Portuguese: ["Cristiano", "Ines"],
  Romanian: ["Carmen"],
  Russian: ["Maxim", "Tatyana"],
  Swedish: ["Astrid"],
  Turkish: ["Filiz"],
  "US English": [
    "Salli",
    "Ivy",
    "Joey",
    "Matthew",
    "Kimberly",
    "Kendra",
    "Justin",
    "Joanna",
  ],
  "US Spanish": ["Lupe", "Penelope", "Miguel"],
  Welsh: ["Gwyneth"],
  "Welsh English": ["Geraint"],
};

let narrators = Object.values(narratorsByLanguage).flatMap((ns) => ns);
let choiceNarrators = ["British English", "US English", "US Spanish"].flatMap(
  (k) => narratorsByLanguage[k]
);
const loadSounds = (narrator, words) =>
  Object.fromEntries(
    words.map((word) => {
      let url = `https://us-west1-jonashw-dev-personal-website.cloudfunctions.net/jonashw-dev-speech-synthesis-proxy?lang=${narrator}&msg=${word}`;
      //let url = `https://storage.googleapis.com/jonashw-dev-speech-synthesis/${lang}-${word}.mp3`;
      return [word, loadSound(url)];
    })
  );

class Puzzle {
  constructor({
    width,
    height,
    rows,
    cols,
    lockedToPlayer,
    domain,
    autoUpdate,
    progressOnClick,
    narrator,
  }) {
    this.sounds = {};
    this.narrator = narrator;
    this.rows = numberOrDefault(rows, 1);
    this.cols = numberOrDefault(cols, 1);
    this.width = numberOrDefault(width, 100);
    this.height = numberOrDefault(height, 100);
    this.domain = Array.isArray(domain) ? domain : [1, 2];
    this.progressOnClick =
      progressOnClick === null || progressOnClick === undefined
        ? true
        : !!progressOnClick;
    //fixed: { 1: { 1: 1 } }
    this.lockedToPlayer =
      typeof lockedToPlayer === "object" ? lockedToPlayer : {};
    let hueSeed = Math.random();
    this.autoUpdate =
      autoUpdate === null || autoUpdate === undefined ? true : !!autoUpdate;
    this.blocks = Array(this.cols)
      .fill()
      .flatMap((_, col) =>
        Array(this.rows)
          .fill()
          .map((_, row) => {
            let i = col + row * this.cols;
            let updating = this.autoUpdate;
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
              sounds: this.sounds,
              hueSeed,
              updating,
              lockedToPlayer: isLockedToPlayer,
              progressOnClick,
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

  draw() {
    for (let b of this.blocks) {
      b.draw();
    }
    if (!!this.narrator) {
      fill(0);
      textStyle(BOLD);
      textSize(20);

      //let tw = textWidth(this.label);
      //let th = textAscent() + textDescent();
      textAlign(CENTER, CENTER);
      textAlign();
      text(this.narrator, width / 2, height / 2);
    }
  }

  update() {
    if (!this.autoUpdate) {
      return;
    }
    for (let b of this.blocks) {
      b.update();
    }
  }

  setup() {
    if (this.autoUpdate) {
      for (let b of this.blocks) {
        b.updating = !b.lockedToPlayer;
      }
    }
    if (!!this.narrator) {
      let sounds = loadSounds(this.narrator, this.domain);
      Object.assign(this.sounds, sounds);
      console.log("Puzzle.setup:sounds", this.sounds);
    }
    console.log("setup", this);
  }
  keyPressed(key) {
    console.log(key);
    if (key === "n") {
      this.randomNarrator();
    }
  }
  randomNarrator() {
    let otherNarrators = choiceNarrators.filter((n) => n !== this.narrator);
    this.narrator =
      otherNarrators[Math.floor(otherNarrators.length * Math.random())];
    console.log("new narrator: ", this.narrator);
    this.setup();
  }
  deviceShaken() {
    if (this.autoUpdate) {
      for (let b of this.blocks) {
        if (b.updating) {
          continue;
        }
        b.deviceShaken();
      }
    } else {
      this.randomNarrator();
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
