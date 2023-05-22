const everyNthFrame = 50;

const puzzleSpecs = [
  {
    narrators: {
      "British English": ["Brian"],
    },
    domain: {
      "British English": [
        "yes, of course.",
        "no, I don't think so.",
        "I'll huff and I'll puff",
        "oh dear.",
        "I wouldn't do that, if I were you",
        "something smells stinky",
        "hey now, please stop eating my spaghetti",
        "let go! You are going to break it",
        "go home and eat oatmeal with your papa",
        "you'd better wash your hands",
      ],
    },
  },
  {
    autoUpdate: false,
    rows: 8,
    progressOnClick: false,
    narrators: {
      "US English": ["Ivy", "Justin", "Salli", "Matthew"],
    },
    domain: {
      "US English": [
        "Yes",
        "No",
        "Not gonna happen",
        "I don't know",
        "I'm scared",
        "I'm Hungry!",
        "Please",
        "I'm sorry",
      ],
    },
  },
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
/* eslint-disable no-undef, no-unused-vars */
let puzzles = [];
let puzzle = undefined;

function setup() {
  fetch(
    "https://storage.googleapis.com/jonashw-dev-speech-synthesis/index.json?v8"
  )
    .then((response) => response.json())
    .then((voices) => {
      console.log({ voices });
      createCanvas(windowWidth, windowHeight);
      colorMode(HSB, 100);
      puzzles = puzzleSpecs.map(
        (spec) =>
          new Puzzle({
            ...spec,
            width,
            height,
            voices: Object.fromEntries(voices.map((v) => [v.name, v])),
          })
      );
      console.log(puzzleSpecs);
      console.log(Hsluv);
      window.Hsluv = Hsluv;
      puzzle = puzzles[0];
      puzzle.setup();

      // document.body registers gestures anywhere on the page
      var hammer = new Hammer(document.body, {
        preventDefault: true,
      });
      hammer.get("swipe").set({
        direction: Hammer.DIRECTION_ALL,
      });

      hammer.on("swipe", swiped);
    });
}
function deviceMoved() {
  //console.log("moved");
  //puzzle.deviceShaken();
}

function swiped(event) {
  console.log(event);
  if (event.direction == 4) {
    puzzleNext();
  } else if (event.direction == 8) {
    msg = "you swiped up";
  } else if (event.direction == 16) {
    msg = "you swiped down";
  } else if (event.direction == 2) {
    puzzlePrev();
  }
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
  if (key === "ArrowLeft") {
    puzzlePrev();
  } else if (key === "ArrowRight") {
    puzzleNext();
  } else {
    puzzle.keyPressed(key);
  }
}

function puzzleNext() {
  let puzzleIndex = puzzles.indexOf(puzzle);
  console.log({ puzzleIndex });
  puzzle = puzzles[puzzleIndex + 1 < puzzles.length ? puzzleIndex + 1 : 0];
  puzzle.setup();
}

function puzzlePrev() {
  let puzzleIndex = puzzles.indexOf(puzzle);
  console.log({ puzzleIndex });
  puzzle = puzzles[0 < puzzleIndex ? puzzleIndex - 1 : puzzles.length - 1];
  puzzle.setup();
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
