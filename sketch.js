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
    domain: {
      "US English":
        "hi,yes,no,maybe,ok,of course,NO WAY JOSÉ!,I farted!,PICKLES!!!,me name na-na,I'm tired".split(
          ","
        ),
      "US Spanish":
        "hola,sí,no,tal vez,bueno,porsopuesto,NUNCA JOSE!,hice un pedo,pepinos!!!,me llamo nana,tengo sueño".split(
          ","
        ),
    },
    narrators: {
      "US English": "Ivy Matthew Salli Justin".split(" "),
      "US Spanish": "Lupe Miguel".split(" "),
    },
    rows: 10,
    cols: 1,
    autoUpdate: false,
    progressOnClick: false,
  },
];

var hammer = new Hammer(document.body, { preventDefault: true });
//hammer.get("swipe").set({
//  direction: Hammer.DIRECTION_ALL,
//});
//hammer.on("swipe", swiped);
function swiped(event) {
  let msg = "";
  console.log(event);
  if (event.direction == 4) {
    msg = "you swiped right";
  } else if (event.direction == 8) {
    msg = "you swiped up";
  } else if (event.direction == 16) {
    msg = "you swiped down";
  } else if (event.direction == 2) {
    msg = "you swiped left";
  }
  alert(msg);
}
/* eslint-disable no-undef, no-unused-vars */
let puzzles = [];
let puzzle = undefined;

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
  console.log(puzzleSpecs);
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
  if (!puzzle) {
    return;
  }
  puzzle.deviceShaken();
  winStatusInvalidated();
}

function draw() {
  if (!puzzle) {
    return;
  }
  if (frameCount % everyNthFrame == 0) {
    puzzle.update();
  }
  puzzle.draw();
}

function touchStarted() {
  if (!puzzle) {
    return;
  }
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
  if (!puzzle) {
    return;
  }
  puzzle.keyPressed(key);
}

function mouseClicked() {
  pixelTouched(mouseX, mouseY);
}

function pixelTouched(x, y) {
  if (!puzzle) {
    return;
  }
  for (let b of puzzle.blocks) {
    if (!b.containsPoint(x, y)) {
      continue;
    }
    b.mouseClicked();
    winStatusInvalidated();
  }
}

function winStatusInvalidated() {
  if (!puzzle) {
    return;
  }
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
  if (!puzzle) {
    return;
  }
  puzzle.width = width;
  puzzle.height = height;
  puzzle.setup();
};
