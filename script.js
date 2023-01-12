const args = {
  widthAndHeight: 1000,
  numOfColumns: 4,
  numOfRows: 3,
  timeLimit: 15,
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

class Card {
  firstCard = false;
  secondCard = false;

  constructor(numOfCards) {
    this.numOfCards = numOfCards;
  }

  flipCardAnimation(card) {
    anime({
      targets: card,
      scale: [{ value: 1 }, { value: 1 }, { value: 1, delay: 250 }],
      rotateY: { value: "+=180", delay: 200 },
      easing: "easeInOutSine",
      duration: 400,
      complete: function () {
        !card.classList.contains("flipped")
          ? card.classList.add("flipped")
          : card.classList.remove("flipped");
      },
    });

    return;
  }

  cardOnClickLogic = (e, stopGame) => {
    e.preventDefault();
    const card = e.target.closest(".card-container");
    if (!card) return;
    if (
      !card.classList.contains("flipped") ||
      !card.classList.contains("matched")
    ) {
      this.flipCardAnimation(card);
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
          this.matchedPairsCount += 1;

          if (this.matchedPairsCount == Math.floor(this.numOfCards / 2)) {
            result.innerHTML = `<h2>You Won</h2>`;
            stopGame();
          }
        } else {
          let [tempFirst, tempSecond] = [this.firstCard, this.secondCard];
          this.firstCard = false;
          this.secondCard = false;

          setTimeout(() => {
            this.flipCardAnimation(tempFirst);
            this.flipCardAnimation(tempSecond);
          }, 800);
        }
      }
    }
  };
}

class MatchGrid {
  constructor(args) {
    this.widthAndHeight = args.widthAndHeight;
    this.numOfColumns = args.numOfColumns;
    this.numOfRows = args.numOfRows;
    this.seconds = args.timeLimit % 60;
    this.minutes = Math.floor(args.timeLimit / 60);
    this.themeColor = args.themeColor;
    this.fontSize = args.fontSize;
    this.card = new Card(args.numOfColumns * args.numOfRows);
  }

  isGameStarted = false;
  isGamePaused = false;
  isCursorOut = false;
  gameEventListener = null;

  convetAndSetTimeValues(seconds, minutes, DOMElement) {
    let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
    let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
    DOMElement.innerHTML = `<span>Time: </span>${minutesValue}:${secondsValue}`;
    return;
  }

  timeGenerator() {
    this.seconds -= 1;

    if ((this.seconds % 60) + 1 === 0) {
      this.minutes -= 1;
      this.seconds += 60;
    }

    this.convetAndSetTimeValues(this.seconds, this.minutes, timeValue);

    if (this.minutes === 0 && this.seconds === 0) {
      result.innerHTML = `<h2>You Lose</h2>`;
      this.stopGame();
    }
  }

  generateRandom() {
    let arrayWithNums = Array.from(
      Array((this.numOfColumns * this.numOfRows) / 2).keys()
    );
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
    for (let i = 0; i < this.numOfColumns * this.numOfRows; i++) {
      gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i]}">
        <div class="card-before" style="background-color: ${args.themeColor};">?</div>
        <div class="card-after"/>${cardValues[i]}</div>
      </div>
      `;
    }

    gameContainer.style.gridTemplateColumns = `repeat(${this.numOfColumns},auto)`;
    this.gameEventListener = (e) => {
      this.card.cardOnClickLogic(e, this.stopGame);
    };
    gameContainer.addEventListener("click", this.gameEventListener);
  }

  replayGame() {
    this.seconds = args.timeLimit % 60;
    this.minutes = Math.floor(args.timeLimit / 60);
    this.convetAndSetTimeValues(this.seconds, this.minutes, timeValue);
    this.card.matchedPairsCount = 0;
    this.seconds = args.timeLimit % 60;
    this.minutes = Math.floor(args.timeLimit / 60);
    gameContainer.removeEventListener("click", this.gameEventListener);
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
    this.card.matchedPairsCount = 0;
    controls.classList.add("hide");
    let cardValues = this.generateRandom();
    this.interval = setInterval(matchingGame.timeGenerator.bind(this), 1000);
    this.matrixGenerator(cardValues);
    this.isCursorOut = false;
  }

  stopGame = () => {
    this.seconds = args.timeLimit % 60;
    this.minutes = Math.floor(args.timeLimit / 60);
    this.isGameStarted = false;
    this.isGamePaused = false;
    this.card.matchedPairsCount = 0;
    controls.classList.remove("hide");
    this.convetAndSetTimeValues(this.seconds, this.minutes, timeValue);
    gameContainer.removeEventListener("click", this.gameEventListener);
    clearInterval(this.interval);
  };
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
