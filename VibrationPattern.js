const VibrationPattern = {
  pulse: (n, onFor, offFor) =>
    Array(n)
      .fill()
      .map((_) => onFor)
      .join("," + offFor.toString() + ",")
      .split(",")
      .map((n) => parseInt(n, 10)),
};
let vibrationPatterns = {
  n: Array(50)
    .fill()
    .map((_, n) => VibrationPattern.pulse(n, 150, 100)),
};
VibrationPattern.buzzer = function buzzer(n) {
  if (!!navigator.vibrate && !!vibrationPatterns) {
    let pattern = vibrationPatterns.n[n];
    if (!!pattern) {
      console.log({ pattern });
      navigator.vibrate(pattern);
    }
  }
};

VibrationPattern.shock = function () {
  if (!!navigator.vibrate && !!vibrationPatterns) {
    navigator.vibrate(25);
  }
};
