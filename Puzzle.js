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

let languageByNarrator = Object.fromEntries(
  Object.entries(narratorsByLanguage).flatMap(([lang, ns]) =>
    ns.map((n) => [n, lang])
  )
);
console.log(languageByNarrator);
let allNarrators = Object.values(narratorsByLanguage).flatMap((ns) => ns);
console.log(allNarrators);
let choiceNarrators = ["British English", "US English", "US Spanish"].flatMap(
  (k) => narratorsByLanguage[k]
);
choiceNarrators = ["Brian", "Salli", "Justin", "Ivy", "Lupe", "Miguel"];
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
    narrators,
  }) {
    this.sounds = {};
    this.narrators = narrators;
    console.log({ narrators });
    this.narrator = "Brian";
    this.words = [1, 2, 3, 4];
    this.narrators = Object.values(narrators).flatMap((ns) => ns);
    this.narrator = this.narrators[0];
    this.domain = domain;
    this.words = domain[this.lang];
    this.rows = numberOrDefault(rows, 1);
    this.cols = numberOrDefault(cols, 1);
    this.width = numberOrDefault(width, 100);
    this.height = numberOrDefault(height, 100);

    this.progressOnClick =
      progressOnClick === null || progressOnClick === undefined
        ? true
        : !!progressOnClick;
    //fixed: { 1: { 1: 1 } }
    this.lockedToPlayer =
      typeof lockedToPlayer === "object" ? lockedToPlayer : {};
    this.hueSeed = 1.0; //Math.random();
    this.autoUpdate =
      autoUpdate === null || autoUpdate === undefined ? true : !!autoUpdate;
    this.blocks = [];
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
      text(
        this.narrator + ` (${this.lang}) (${this.gender}) (${this.age})`,
        width / 2,
        height / 2
      );
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
    if (!!this.narrator) {
      let sounds = loadSounds(this.narrator, this.words);
      Object.assign(this.sounds, sounds);
      console.log("Puzzle.setup:sounds", this.sounds);
    }
    console.log("setup", this);
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
              if (0 <= lockedIndex && lockedIndex < this.words.length) {
                i = lockedIndex;
                updating = false;
                isLockedToPlayer = true;
              } else {
                i = 0;
                updating = false;
              }
            }
            let { hueSeed, progressOnClick } = this;
            return new NumberBlock({
              words: this.words,
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

    if (this.autoUpdate) {
      for (let b of this.blocks) {
        b.updating = !b.lockedToPlayer;
      }
    }
  }
  keyPressed(key) {
    console.log(key);
    if (key === "n") {
      this.nextNarrator();
    }
    if (key === "g") {
      this.nextNarrator("gender");
    }
    if (key === "a") {
      this.nextNarrator("age");
    }
    if (key === "l") {
      this.nextNarrator("lang");
    }
  }
  nextNarrator(facet) {
    if (!!facet) {
      let matchCriteria = Object.entries(voices[this.narrator]).map(
        ([f, value]) =>
          (tags) =>
            f in tags && (f === facet ? tags[f] !== value : tags[f] === value)
      );
      let matches = Object.entries(voices).filter(([voice, tags]) =>
        matchCriteria.every((mc) => mc(tags))
      );
      console.log(facet, matches);
      if (matches.length > 0) {
        this.narrator = matches[0][0];
        this.words = this.domain[this.lang];
        console.log("new narrator: ", this.narrator);
        this.setup();
      }
      return;
    }
    let i = this.narrators.indexOf(this.narrator);
    i++;
    if (i >= this.narrators.length) {
      i = 0;
    }
    this.narrator = this.narrators[i];
    this.words = this.domain[this.lang];
    console.log("new narrator: ", this.narrator);
    this.setup();
  }
  get lang() {
    return languageByNarrator[this.narrator];
  }
  get gender() {
    return voices[this.narrator].gender;
  }
  get age() {
    return voices[this.narrator].age;
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
      this.nextNarrator();
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
