"use strict";
console.log("Minesweeper");

const MINE = "馃挘";
const FLAG = "馃毄";
const LIFE = "馃挆";

const HAPPY = "馃槂";
const AFRAID = "馃槓";
const LOSS = "馃樀";
const WIN = "馃槑";

var gLife = 3;
var gTimeInterval;
var gTitleInterval;
var gHappyInterval;
var gTotalSeconds = -1;
var gBoard;
var gLevel = {
  SIZE: 4,
  MINES: 2,
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: gLevel.MINES,
  secsPassed: 0,
};

function init() {
  // 诪讗转讞诇转 讗转 讛诪砖讞拽 讗讞专讬 讻诇 住讬讜诐 诪砖讞拽
  document.getElementById("center").style.pointerEvents = "all";
  var elBtn = document.querySelector(".newGame");
  elBtn.innerText = HAPPY;
  gGame.markedCount = gLevel.MINES;
  var elFlags = document.getElementById("flags");
  elFlags.innerHTML = " " + gLevel.MINES;
  gBoard = buildBoard();
  gGame.isOn = false;
  gLife = 3;
  var elLives = document.querySelector(".lives");
  elLives.innerText = "馃挆 馃挆 馃挆";
  renderBoard(gBoard);
  clearInterval(gTimeInterval);
  gTotalSeconds = -1;
  setTime();
  var elTitle = document.querySelector(".liveMsg");
  elTitle.innerHTML = "You lost a life, try again";
  elTitle.style.fontSize = "25px";
  elTitle.style.visibility = "hidden";
  var elLives = document.querySelector(".lives");
  elLives.innerText = "馃挆 馃挆 馃挆";
  elLives.style.visibility = "visible";
}

function buildBoard() {
  // 讘讜谞讛 讗转 讛诇讜讞 讘诪讜讚诇
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  // console.table(board);
  return board;
}

function renderBoard(board) {
  // 诪专谞讚专转 讗转 讛诇讜讞 讘讚讜诐
  // console.table(board);
  var elBoard = document.querySelector(".board");
  var strHTML = "";
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currCell = board[i][j];
      var cellClass = getClassName({ i: i, j: j });
      strHTML += `\t<td class="`;

      if (!currCell.isShown) strHTML += "hide";
      if (currCell.isShown) strHTML += "show";
      var neighbors = setMinesNegsCount(i, j, board);
      if (currCell.isMine && currCell.isShown) {
        neighbors = MINE;
        strHTML += " bombShow";
      }
      if (neighbors === 0) neighbors = " ";
      strHTML += ` cell ${cellClass}" onclick="cellClicked(${i},${j})" 
      oncontextmenu = "cellMarked(this, ${i},${j})"> \n${neighbors} </td>`;
    }
    strHTML += "\n</tr>\n";
    // console.log(strHTML);
    elBoard.innerHTML = strHTML;
  }
  // console.log(board);
}

function setMinesNegsCount(cellI, cellJ, mat) {
  // 讘讜讚拽转 讛讗诐 讛砖讻谞讬诐 讛诐 驻爪爪讜转
  var neighborsSum = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= mat[i].length) continue;
      if (i === cellI && j === cellJ) continue;
      if (mat[i][j].isMine) neighborsSum++;
    }
  }
  //console.log(neighborsSum);
  return neighborsSum;
}

function cellClicked(i, j) {
  // 诪讛 拽讜专讛 讘讻诇 诇讞讬爪讛 注诇 转讗
  // 讛讗诐 讛诪砖讞拽 注讜讚 诇讗 讛转讞讬诇 (诇讞讬爪讛 专讗砖讜谞讛 讘诪砖讞拽)
  if (!gGame.isOn) {
    gTimeInterval = setInterval(setTime, 1000);
    createBombs(gBoard, gLevel.MINES, i, j);
    gGame.isOn = true;
  }
  var currCell = gBoard[i][j];
  var neighbors = setMinesNegsCount(i, j, gBoard);
  //讛讗诐 诇讞爪转讬 注诇 驻爪爪讛:
  if (currCell.isMine) {
    renderCell(i, j, MINE);
    GameLose();
  } else {
    // 讛讗诐 诇讞爪转讬 注诇 转讗 诇诇讗 驻爪爪讛 (诪住驻专):
    renderCell(i, j, neighbors);
    var elBtn = document.querySelector(".newGame");
    elBtn.innerText = AFRAID;
    gHappyInterval = setTimeout(function () {
      elBtn.innerText = HAPPY;
    }, 150);
    if (neighbors === 0) expandShown(gBoard, i, j); // 讛讗诐 诇讞爪转讬 注诇 诪住驻专 '0' (讘诇讬 砖讻谞讬诐)
  }
  checkVictory();
}

function createBombs(board, amount, cellI, cellJ) {
  // 诪讬讬爪专转 驻爪爪讜转, 专拽 讗讞专讬 讛诇讞讬爪讛 讛专讗砖讜谞讛
  var bomb = {
    minesAroundCount: 0,
    isShown: false,
    isMine: true,
    isMarked: false,
  };
  for (let i = 0; i < amount; i++) {
    var num1 = getRandNum();
    var num2 = getRandNum();
    if (
      !board[num1][num2].isMine &&
      board[num1][num2] !== board[cellI][cellJ]
    ) {
      board[num1][num2] = bomb;
    } else {
      i--;
    }
  }
}

function changeLevel(size, mines) {
  // 诪砖谞讛 讗转 讙讜讚诇 讛讟讘诇讛
  gLevel.SIZE = size;
  gLevel.MINES = mines;
  init();
}

function GameLose() {
  //诪讜专讬讚讛 讞讬讬诐 讘转爪讜讙讛
  var elBtn = document.querySelector(".newGame");
  var elLives = document.querySelector(".lives");
  elBtn.innerText = LOSS;
  elLives.innerText = "";
  gLife--;
  for (var i = 0; i < gLife; i++) {
    elLives.innerText += "馃挆 ";
  }

  // 讛爪讙转 讛讻讜转专转 砖诇 讬专讬讚转 讞讬讬诐
  var elTitle = document.querySelector(".liveMsg");
  elTitle.style.visibility = "visible";
  gTitleInterval = setTimeout(function () {
    elBtn.innerText = HAPPY;
    elTitle.style.visibility = "hidden";
  }, 1000);

  if (gLife === 0) {
    // 诇讞讬爪讛 注诇 驻爪爪讛 讘诇讘 讛讗讞专讜谉
    // 砖讬谞讜讬 讛讜讚注讛
    elTitle.innerHTML = "YOU LOST!";
    elTitle.style.visibility = "visible";
    clearInterval(gTitleInterval);

    // 讞砖讬驻转 讛诪讜拽砖讬诐
    elBtn.innerText = LOSS;
    for (var i = 0; i < gLevel.SIZE; i++) {
      for (var j = 0; j < gLevel.SIZE; j++) {
        if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
        renderBoard(gBoard);
      }
    }
    // 讛住转专讛 砖诇 讛诇讘讘讜转
    var elLives = document.querySelector(".lives");
    elLives.innerText = "馃挆 馃挆 馃挆";
    elLives.style.visibility = "hidden";
    clearInterval(gTimeInterval);

    // 诪驻住讬拽 讗转 讛讗驻砖专讜转 诇诇讞讜抓 注诇 讛讟讘诇讛
    document.getElementById("center").style.pointerEvents = "none";
  }
}

function cellMarked(str, i, j) {
  // 讛讗诐 讝讛 讛拽诇讬拽 讛专讗砖讜谉 讘诪砖讞拽
  if (!gGame.isOn) {
    gTimeInterval = setInterval(setTime, 1000);
    createBombs(gBoard, gLevel.MINES, i, j);
    gGame.isOn = true;
  }

  //  讛讗诐 诇讞爪转讬 注诇 讚讙诇 拽讬讬诐 (讘讬讟讜诇 讚讙诇 拽讬讬诐)
  if (gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = false;
    if (gGame.markedCount < gLevel.MINES) {
      gGame.markedCount++;
    }
    gBoard[i][j].isShown = false;
    str.innerText = "";
    if (gBoard[i][j].isMine) {
      gBoard[i][j].isMarked = true;
      str.innerText = FLAG;
    }
  } else {
    // 讛讗诐 住讬诪谞转讬 讚讙诇 讘诪拽讜诐 讘诇讬 讚讙诇

    if (!gBoard[i][j].isShown) {
      // 讛讗诐 住讬诪谞转讬 讚讙诇 讘诪拽讜诐 砖讛讜讗 诇讗 诇讞讜抓 (专拽注 诇讘谉)
      if (gGame.markedCount > 0) {
        //讛讗诐 讻诪讜转 讛讚讙诇讬诐 讙讚讜诇讛 诪-0
        str.innerText = FLAG;
        gBoard[i][j].isMarked = true;
        gGame.markedCount--;
      }
    }
  }
  var elFlags = document.getElementById("flags");
  elFlags.innerHTML = " " + gGame.markedCount;

  checkVictory();
}

function checkVictory() {
  // 转谞讗讬诐 诇谞讬爪讞讜谉
  var shownCounter = 0;
  var bombMarkedCounter = 0;
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var className = ".";
      className += getClassName({ i: i, j: j });
      var elCellFlag = document.querySelector(className);
      console.log(bombMarkedCounter);
      if (gBoard[i][j].isShown) shownCounter++;
      if (gBoard[i][j].isMine) {
        if (elCellFlag.innerHTML === FLAG) {
          bombMarkedCounter++;
        }
      }
    }
  }
  if (
    // 讛讗诐 讻诪讜转 讛转讗讬诐 讛驻转讜讞讬诐 (驻讞讜转 讛驻爪爪讜转 讛讞砖讜驻讜转) 砖讜讜讛 诇讙讜讚诇 讛诇讜讞(驻讞讜转 讻诪讜转 讛驻爪爪讜转)
    shownCounter === gLevel.SIZE ** 2 - gLevel.MINES ||
    bombMarkedCounter === gLevel.MINES
  ) {
    gameWin();
  }
}

function gameWin() {
  // 诪讛 拽讜专讛 讘诪爪讘 砖诇 谞爪讞讜谉
  var elTitle = document.querySelector(".liveMsg");
  var elBtn = document.querySelector(".newGame");
  clearInterval(gTimeInterval);
  clearInterval(gTitleInterval);
  clearInterval(gHappyInterval);
  document.getElementById("center").style.pointerEvents = "none";
  elTitle.innerHTML = "YOU WON!";
  elTitle.style.visibility = "visible";
  elBtn.innerText = WIN;
}

function expandShown(board, cellI, cellJ) {
  // 诇讜诇讗转 砖讻谞讬诐, 诪专讞讬讘讛 讗转 讛转讗讬诐 诪住讘讬讘 讘诪讬讚讛 讜讗讬谉 驻爪爪讜转 诪住讘讬讘
  var neighbors = setMinesNegsCount(cellI, cellJ, board);
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === cellI && j === cellJ) continue;
      if (board[i][j].isMarked) continue;
      if (board[i][j].isShown) continue;
      board[i][j].isShown = true;
      neighbors = setMinesNegsCount(i, j, board);
      if (neighbors === 0) expandShown(gBoard, i, j);
      renderCell(i, j, neighbors);
    }
  }
}
