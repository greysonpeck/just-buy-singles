const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};
// Random number between 0 and 100
rareRollRaw = getRandomNumber(0, 4);
rareRoll = Math.round(rareRollRawd);
console.log(rareRoll);
