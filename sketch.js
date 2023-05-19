const everyNthFrame = 50;
let yesNoSounds = {};
let range = (from, to) =>
  Array(to - from + 1)
    .fill()
    .map((_, i) => from + i);
const emojis = ["💀", "🔥", "❤️", "🙂", "😍", "🤡", "👽", "🤘"];
const randRange = (arr, n) => {
  let indexes = [];
  for (let i = 0; i < n; i++) {
    let index = Math.floor(Math.random() * arr.length);
    if (indexes.indexOf(index) === -1) {
      indexes.push(index);
    }
  }
  return indexes.map((i) => arr[i]);
};
const puzzleSpecs = [
  {
    domain: ["yes", "no", "maybe", "ok"],
    narrator: "Amy",
    rows: 4,
    autoUpdate: false,
    progressOnClick: false,
  },
  {
    rows: 2,
    domain: randRange(emojis, 2),
    lockedToPlayer: { "0,0": 0 },
  },
  {
    cols: 3,
    domain: randRange(emojis, 3),
    autoUpdate: false,
    lockedToPlayer: { "1,0": 1 },
  },
  {
    rows: 2,
    domain: ["Yes", "No"],
    lockedToPlayer: { "0,1": 0 },
    autoUpdate: false,
  },
  {
    rows: 2,
    cols: 2,
    narrator: "Brian",
    domain: range(1, 4),
    lockedToPlayer: { "0,1": 2 },
    autoUpdate: false,
  },
  { rows: 3, cols: 3, domain: range(1, 3), lockedToPlayer: { "1,1": 2 } },
];

/* eslint-disable no-undef, no-unused-vars */
let puzzles = [Puzzle.nullObject()];
let puzzle = puzzles[0];
let puzzleSpec = puzzle.spec;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 100);
  puzzles = puzzleSpecs.map(
    (spec) =>
      new Puzzle({
        ...spec,
        width,
        height,
      })
  );
  console.log(Hsluv);
  window.Hsluv = Hsluv;
  puzzle = puzzles[0];
  puzzle.setup();
}
function deviceMoved() {
  //console.log("moved");
  //puzzle.deviceShaken();
}

function deviceShaken() {
  puzzle.deviceShaken();
  winStatusInvalidated();
}

function draw() {
  update();
  puzzle.draw();
}

function update() {
  if (frameCount % everyNthFrame !== 0) {
    return;
  }
  puzzle.update();
}

function touchStarted() {
  let touch = touches[touches.length - 1];
  if (!touch) {
    return;
  }
  console.log(touch);
  pixelTouched(touch.x, touch.y);
}

function touchEnded() {
  return false;
}
function keyPressed() {
  puzzle.keyPressed(key);
}

function mouseClicked() {
  pixelTouched(mouseX, mouseY);
}

function pixelTouched(x, y) {
  for (let b of puzzle.blocks) {
    if (!b.containsPoint(x, y)) {
      continue;
    }
    b.mouseClicked();
    winStatusInvalidated();
  }
}

function winStatusInvalidated() {
  let win = puzzle.tryGetWin();
  if (!!win) {
    puzzle.winAnimation();
    VibrationPattern.buzzer(2);
    setTimeout(() => {
      let nextPuzzle = puzzles[(puzzles.indexOf(puzzle) + 1) % puzzles.length];
      puzzle = nextPuzzle;
      puzzle.setup();
      puzzle.welcomeAnimation();
    }, 1000);
    //alert("You win!");
  }
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
