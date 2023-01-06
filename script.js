const args = {
  widthAndHeight: 1000,
  numOfColumnsAndRows: 6,
  timeLimit: 10,
  themeColor: "crimson",
  fontSize: 18,
};

const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const replayButton = document.getElementById("replay");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const wrapper = document.querySelector(".wrapper");

wrapper.style.fontSize = `${args.fontSize}px`;
wrapper.style.width = `${args.widthAndHeight}px`;
document.getElementById("stop").style.fontSize = `${args.fontSize}px`;
document.getElementById("start").style.fontSize = `${args.fontSize}px`;
document.getElementById("replay").style.fontSize = `${args.fontSize}px`;

document.body.style.backgroundColor = args.themeColor;
document.querySelector(".controls-container").style.backgroundColor =
  args.themeColor;

let cards;
let interval;

class MatchGrid {
  constructor(args) {
    this.widthAndHeight = args.widthAndHeight;
    this.numOfColumnsAndRows = args.numOfColumnsAndRows;
    this.timeLimit = args.timeLimit;
    this.themeColor = args.themeColor;
    this.fontSize = args.fontSize;
  }

  seconds = 0;
  minutes = 0;
  isGameStarted = false;
  isGamePaused = false;
  firstCard = false;
  secondCard = false;
  winCount = 0;
  isCursorOut = false;

  timeGenerator() {
    this.seconds += 1;

    if (this.seconds >= 60) {
      this.minutes += 1;
      this.seconds = 0;
    }

    let secondsValue = this.seconds < 10 ? `0${this.seconds}` : this.seconds;
    let minutesValue = this.minutes < 10 ? `0${this.minutes}` : this.minutes;
    timeValue.innerHTML = `<span>Time: </span>${minutesValue}:${secondsValue}`;

    if (this.seconds === this.timeLimit) {
      result.innerHTML = `<h2>You Lose</h2>`;
      this.stopGame();
    }
  }

  generateRandom() {
    let arrayWithNums = Array.from(Array(this.numOfColumnsAndRows * 2).keys());
    arrayWithNums = arrayWithNums.concat(arrayWithNums);

    let currentIndex = arrayWithNums.length,
      randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [arrayWithNums[currentIndex], arrayWithNums[randomIndex]] = [
        arrayWithNums[randomIndex],
        arrayWithNums[currentIndex],
      ];
    }

    return arrayWithNums;
  }

  matrixGenerator(cardValues) {
    gameContainer.innerHTML = "";
    for (let i = 0; i < this.numOfColumnsAndRows * 4; i++) {
      gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i]}">
        <div class="card-before" style="background-color: ${args.themeColor};">?</div>
        <div class="card-after"/>${cardValues[i]}</div>
      </div>
      `;
    }

    gameContainer.style.gridTemplateColumns = `repeat(${this.numOfColumnsAndRows},auto)`;
    cards = document.querySelectorAll(".card-container");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (card.classList.contains("flipped")) return;
        if (!card.classList.contains("matched")) {
          anime({
            targets: card,
            scale: [{ value: 1 }, { value: 1 }, { value: 1, delay: 250 }],
            rotateY: { value: "+=180", delay: 200 },
            easing: "easeInOutSine",
            duration: 400,
            complete: function () {
              card.classList.add("flipped");
            },
          });
          if (!this.firstCard) {
            this.firstCard = card;
            this.firstCardValue = card.getAttribute("data-card-value");
          } else {
            this.secondCard = card;
            let secondCardValue = card.getAttribute("data-card-value");
            if (this.firstCardValue == secondCardValue) {
              this.firstCard.classList.add("matched");
              this.secondCard.classList.add("matched");
              this.firstCard = false;
              this.winCount += 1;

              if (this.winCount == Math.floor(cardValues.length / 2)) {
                result.innerHTML = `<h2>You Won</h2>`;
                this.stopGame();
              }
            } else {
              let [tempFirst, tempSecond] = [this.firstCard, this.secondCard];
              this.firstCard = false;
              this.secondCard = false;

              let delay = setTimeout(() => {
                anime({
                  targets: tempFirst,
                  scale: [{ value: 1 }, { value: 1 }, { value: 1, delay: 250 }],
                  rotateY: { value: "+=180", delay: 200 },
                  easing: "easeInOutSine",
                  duration: 400,
                  complete: function () {
                    tempFirst.classList.remove("flipped");
                  },
                });

                anime({
                  targets: tempSecond,
                  scale: [{ value: 1 }, { value: 1 }, { value: 1, delay: 250 }],
                  rotateY: { value: "+=180", delay: 200 },
                  easing: "easeInOutSine",
                  duration: 400,
                  complete: function () {
                    tempSecond.classList.remove("flipped");
                  },
                });
              }, 800);
            }
          }
        }
      });
    });
  }

  replayGame() {
    timeValue.innerHTML = `<span>Time: </span>00:00`;
    this.seconds = 0;
    this.minutes = 0;
    clearInterval(this.interval);
    this.startGame();
  }

  pauseGame() {
    this.isGamePaused = true;
    this.isCursorOut = true;
    clearInterval(this.interval);
  }

  resumeGame() {
    if (!this.isCursorOut) return;

    this.isGamePaused = false;
    this.isCursorOut = false;
    this.interval = setInterval(matchingGame.timeGenerator.bind(this), 1000);
  }

  startGame() {
    this.isGameStarted = true;
    this.winCount = 0;
    controls.classList.add("hide");
    stopButton.classList.remove("hide");
    replayButton.classList.remove("hide");
    startButton.classList.add("hide");
    let cardValues = this.generateRandom();
    this.interval = setInterval(matchingGame.timeGenerator.bind(this), 1000);
    this.matrixGenerator(cardValues);
    this.isCursorOut = false;
  }

  stopGame() {
    this.isGameStarted = false;
    this.isGamePaused = false;
    controls.classList.remove("hide");
    stopButton.classList.add("hide");
    replayButton.classList.add("hide");
    startButton.classList.remove("hide");

    timeValue.innerHTML = `<span>Time: </span>00:00`;
    this.seconds = 0;
    this.minutes = 0;
    clearInterval(this.interval);
  }
}

const matchingGame = new MatchGrid(args);

startButton.addEventListener("click", () => {
  if (matchingGame.isGameStarted === true) return;

  matchingGame.startGame();
});

stopButton.addEventListener("click", () => {
  result.innerHTML = ``;
  matchingGame.stopGame();
});

replayButton.addEventListener("click", () => {
  matchingGame.replayGame();
});

wrapper.addEventListener("mouseleave", () => {
  matchingGame.pauseGame();
});

wrapper.addEventListener("mouseenter", () => {
  matchingGame.resumeGame();
});
