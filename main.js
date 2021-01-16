const players = (player) => {
  if (player === "player1") {
    return {
      name: document.getElementById("x").value,
      symbol: "X",
      type: "human",
    };
  }
  if (player === "player2") {
    const computerSelection = document.querySelector(
      'input[name="player-type-2"]:checked'
    ).value;
    return {
      name:
        computerSelection !== "human"
          ? "computer"
          : document.getElementById("o").value,
      symbol: "O",
      type: document.querySelector('input[name="player-type-2"]:checked').value,
    };
  }
};

const display = (() => {
  const board = document.querySelector(".board");
  const again = document.querySelector(".btn--again");
  const restart = document.querySelector(".btn--restart");
  const gameOver = document.querySelector(".game-over");
  const winner = document.querySelector(".winner");
  const start = document.querySelector(".btn--start");
  const form = document.querySelector(".name-form");
  return {
    board,
    again,
    restart,
    gameOver,
    winner,
    start,
    form,
  };
})();

const gameBoard = (() => {
  let items = ["", "", "", "", "", "", "", "", ""];

  const render = () => {
    display.board.innerHTML = "";
    items.map((el, idx) => {
      const boardElement = document.createElement("div");
      boardElement.classList.add("board__tile");
      boardElement.innerHTML = el;
      boardElement.dataset.tile = idx;
      display.board.append(boardElement);
    });
  };
  const input = (e, player) => {
    const el = e.target.dataset.tile;
    if (!items[el] && el) {
      items[el] = player.symbol;
      render();
      return true;
    }
  };
  const inputComputerRandom = (player) => {
    // get a random location in the array
    const generateRandom = () => Math.floor(Math.random() * items.length);
    let random = generateRandom();
    let randomArrIdx = items[random];
    // check if the location is empty
    while (randomArrIdx !== "") {
      random = generateRandom();
      randomArrIdx = items[random];
    }
    // insert players symbol in tha location
    items[random] = player.symbol;
    // render updated board
    render();
  };
  const showWinner = (winner) => {
    console.log(winner);
    if (winner) {
      display.gameOver.style.display = "block";
      display.winner.textContent =
        winner === "computer"
          ? `Too bad, ${winner} won this time 😥`
          : `Congratulations ${winner}, you WON 🎉`;
    } else {
      display.gameOver.style.display = "block";
      display.winner.textContent = `It's a TIE 😬`;
    }
  };
  const isBoardFull = () => {
    return !items.includes("");
  };
  const checkBoard = (arr, symbol) => {
    return (
      items[arr[0]] === symbol &&
      items[arr[1]] === symbol &&
      items[arr[2]] === symbol
    );
  };
  const findEmptyIndex = (board) => {
    return board.reduce((acc, el, idx) => {
      if (el !== "X" && el !== "O") {
        acc.push(idx);
      }
      return acc;
    }, []);
  };
  const inputComputerBest = (player) => {
    let bestScore = -Infinity;
    let moveIdx;
    // find the first available spot to play
    gameBoard.findEmptyIndex(items).forEach((el) => {
      // play there
      items[el] = player.symbol;
      // run minimax to evaluate score
      let score = game.minimax(items, 0, false);
      // undo the move
      items[el] = "";
      // if minimax returns a score that is greater than -Infinity that means that it is the best move
      if (score > bestScore) {
        bestScore = score;
        moveIdx = el;
      }
    });
    // place the move there
    items[moveIdx] = player.symbol;
    render();
  };
  const reset = () => {
    display.board.innerHTML = "";
    items = ["", "", "", "", "", "", "", "", ""];
    display.gameOver.style.display = "none";
    display.winner.textContent = "";
  };
  return {
    render,
    input,
    inputComputerRandom,
    showWinner,
    isBoardFull,
    reset,
    checkBoard,
    findEmptyIndex,
    inputComputerBest,
  };
})();

const game = (() => {
  let player1 = {};
  let player2 = {};
  let player, winner;

  const init = (e) => {
    e.preventDefault();
    player1 = players("player1");
    player2 = players("player2");
    display.form.style.display = "none";
    gameBoard.render();
    player = player1;
    display.board.addEventListener("click", play);
  };
  const gameOver = (player) => {
    display.board.removeEventListener("click", play);
    player ? gameBoard.showWinner(winner) : gameBoard.showWinner();
  };
  const checkWinner = ({ symbol }) => {
    const winningArr = [
      // ["X", "X", "X", "", "", "", "", "", ""]
      [0, 1, 2],
      // ["", "", "", "X", "X", "X", "", "", ""]
      [3, 4, 5],
      // ["", "", "", "", "", "", "X", "X", "X"]
      [6, 7, 8],
      // ["X", "", "", "X", "", "", "X", "", ""]
      [0, 3, 6],
      // ["", "X", "", "", "X", "", "", "X", ""]
      [1, 4, 7],
      // ["", "", "X", "", "", "X", "", "", "X"]
      [2, 5, 8],
      // ["X", "", "", "", "X", "", "", "", "X"]
      [0, 4, 8],
      // ["", "", "X", "", "X", "", "X", "", ""]
      [2, 4, 6],
    ];

    return winningArr.some((arr) => {
      if (gameBoard.checkBoard(arr, symbol)) return true;
    });
  };
  const switchPlayer = (currentPlayer) => {
    return currentPlayer === player1 ? (player = player2) : (player = player1);
  };
  const play = (e) => {
    // person takes turn
    if (gameBoard.input(e, player)) {
      if (checkWinner(player)) {
        winner = player.name;
        gameOver(player);
      }
      if (gameBoard.isBoardFull() && !winner) return gameOver();
      switchPlayer(player);
    }
    // and then computer responds
    if (
      player === player2 &&
      (player2.type === "computer" || player2.type === "computer-ai") &&
      !winner
    ) {
      player2.type === "computer"
        ? gameBoard.inputComputerRandom(player)
        : gameBoard.inputComputerBest(player);

      if (checkWinner(player)) {
        winner = player.name;
        gameOver(player);
      }
      if (gameBoard.isBoardFull()) {
        gameOver();
      }
      switchPlayer(player);
    }
  };
  const minimax = (items, depth, isMaximizing) => {
    let bestScore;
    // check for terminal state and return is found
    if (checkWinner(player1)) {
      return -10;
    } else if (checkWinner(player2)) {
      return 10;
    } else if (gameBoard.isBoardFull()) {
      return 0;
    }

    const simulateTurn = (isComputer) => {
      bestScore = isComputer ? -Infinity : Infinity;
      gameBoard.findEmptyIndex(items).forEach((el) => {
        // play there
        items[el] = isComputer ? player2.symbol : player1.symbol;
        // run minimax to evaluate score
        let score = game.minimax(items, depth + 1, isComputer ? false : true);
        // undo the move
        items[el] = "";
        // if minimax returns a score that is greater than -Infinity that means that it is the best move
        bestScore = isComputer
          ? Math.max(score, bestScore)
          : Math.min(score, bestScore);
      });
      return bestScore;
    };

    return isMaximizing ? simulateTurn(true) : simulateTurn();
  };
  const playAgain = (e) => {
    player = player1;
    winner = null;
    gameBoard.reset();
    init(e);
  };
  const restart = () => {
    location.reload();
    return false;
  };

  return { init, playAgain, restart, minimax };
})();

display.start.addEventListener("click", game.init);
display.again.addEventListener("click", game.playAgain);
display.restart.addEventListener("click", game.restart);
