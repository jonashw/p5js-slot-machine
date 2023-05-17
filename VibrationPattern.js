const VibrationPattern = {
  pulse: (n, onFor, offFor) =>
    Array(n)
      .fill()
      .map((_) => onFor)
      .join("," + offFor.toString() + ",")
      .split(",")
      .map((n) => parseInt(n, 10))
};
let vibrationPatterns = {
  n: Array(50)
    .fill()
    .map((_, n) => VibrationPattern.pulse(n, 150, 100))
};
