import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

import { PossibleBoard } from './possibleboard-model';

/**
 * Root Component for TicTacToe Game
 *
 * @export
 * @class AppComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userScore = 0;
  computerScore = 0;
  playingGame = false;
  title = 'app';
  playerChoice = 'O';
  playerX = false;
  gameLevel = 'easy';
  computerNextMove = 0;
  firstMove = true;
  turnCounter = 0;
  currentBoard = [
    ' ', ' ', ' ',
    ' ', ' ', ' ',
    ' ', ' ', ' ',
  ];
  positions = [
    'topLeft',
    'topMiddle',
    'topRight',
    'middleLeft',
    'middleMiddle',
    'middleRight',
    'bottomLeft',
    'bottomMiddle',
    'bottomRight'
  ];

  /**
   * Creates an instance of AppComponent.
   * @param {MatDialog} dialog
   * @param {MatSnackBar} snackBar
   * @memberof AppComponent
   */
  constructor(public dialog: MatDialog,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  /**
   * Initialize game values, display modal to get player's choice of X or O
   *
   * @memberof AppComponent
   */
  startGame() {
    // This starts the game
    for (let i = 0; i < this.currentBoard.length; i++) {
      this.currentBoard[i] = ' ';
    }
    this.playingGame = true;
    this.turnCounter = 0;
    this.playerX = false;
    this.firstMove = true;
    this.getPlayerChoice();
  }

  /**
   * Event handler for when user clicks on a playing square
   *
   * @param {any} position
   * @memberof AppComponent
   */
  keyPress(position) {
    console.log('Key was pressed ' + position);

    // If you aren't playing a game, don't let the user do anything!
    if (this.playingGame) {
      if (this.currentBoard[position] === ' ') {
        if (this.playerX) {
          this.currentBoard[position] = 'X';
        } else {
          this.currentBoard[position] = 'O';
        }
        this.turnCounter++;
        if (this.checkGameStatus()) {
          this.userScore++;
          this.showGameOverDialog('You Win!!!!');
        } else {
          this.computerChoice();
        }
      }
    }
  }

  /**
   * Return a random number between min and max
   *
   * @param {any} min
   * @param {any} max
   * @returns
   * @memberof AppComponent
   */
  getRandomIntInclusive(min, max) {
    // Helper function that returns a random number between min & max
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Show dialog to get player's choice of X or O, if the user chooses O, the computer
   * goes first because X goes first.
   *
   * @memberof AppComponent
   */
  getPlayerChoice(): void {
    const dialogRef = this.dialog.open(ChoiceDialogComponent, {
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.playerChoice = result.playerChoice;
      this.gameLevel = result.gameLevel;
      console.log('Player picked :' + this.playerChoice + ' gamelevel is ' + this.gameLevel);
      this.openSnackBar('It\'s your turn!', 'Put an ' + this.playerChoice + ' in any square.');
      this.playerX = (this.playerChoice === 'X') ? true : false;
      if (!this.playerX) {
        this.computerChoice();
      }
    });
  }

  /**
   * The computer takes a turn. After it takes a turn it checks to see if the game is over and if
   * it is, it displays the game over modal. If this function calls getRandomPick then it is the
   * easier version of the game. If it calls getComputerMove it is using the harder version.
   *
   * @memberof AppComponent
   */
  computerChoice() {
    // If I am using getRandomPick, this is the easy version of the game.
    // If I am using getComputerMove, it is the hard version of the game.

    let myChoice = 0;
    if (this.gameLevel === 'easy') {
      myChoice = this.getRandomPick();
    } else {
      myChoice = this.getComputerMove();
    }

    this.turnCounter++;
    if (this.playerX) {
      this.currentBoard[myChoice] = 'O';
    } else {
      this.currentBoard[myChoice] = 'X';
    }
    if (this.checkGameStatus()) {
      this.computerScore++;
      this.showGameOverDialog('I Win!!!!');
    } else {
      this.openSnackBar('It\'s your turn!', 'Put an ' + this.playerChoice + ' in any square.');
    }
  }

  /**
   * Choose a random empty square on the board
   *
   * @returns
   * @memberof AppComponent
   */
  getRandomPick() {

    let validChoice = false;
    let tryOne = 0;

    while (!validChoice) {
      tryOne = this.getRandomIntInclusive(0, 8);
      if (this.currentBoard[tryOne] === ' ') {
        validChoice = true;
      }
      return (tryOne);
    }
  }

  getComputerMove() {

    // If this is NOT the computer's first move run the minimax algorthim and let that decide the next move.
    // Otherwise, use the following to decide the computer's next move: if the computer goes first take
    // the upper left hand corner. If the user goes first and takes the middle, go in the corner. If the
    // user takes the corner or the side, take the middle.

    if (!this.firstMove) {
        const thisBoard = new PossibleBoard('user', this.currentBoard.slice(), 0, this.playerX);
        thisBoard.consoleMe();
        const thisScore = this.miniMax(thisBoard);
        return this.computerNextMove;
    } else {
        this.firstMove = false;
        if (!this.playerX) { // Computer is going first, it is the first move, just take the corner
           this.computerNextMove = 0;
           return this.computerNextMove;
        } else  { // The user went first, it's the computers first turn
          if ((this.currentBoard[0] === 'X') || (this.currentBoard[2] === 'X') ||
               (this.currentBoard[6] === 'X') || (this.currentBoard[6] === 'X')) { // The user took a corner so computer takes the middle
               this.computerNextMove = 4;
               return this.computerNextMove;
          } else { // The user took a side or center, computer takes the corner
             this.computerNextMove = 0;
             return this.computerNextMove;
          }
        }
    }

  }

  miniMax(boardGame: PossibleBoard) {

    // The current board is inconclusive, so make an array of all possible moves
    let scoreIndex = 0;
    let returnScore = 0;
    const scores = [];
    const moves = [];
    let result = 0;

    boardGame.consoleMe();

    // First score this game. If it has a winning or losing score, return with that score
    const score = boardGame.scoreGame();
    if (score !== 0) {
      return score;
    }

    for (let boardGameIndex = 0; boardGameIndex < 9; boardGameIndex++) {
      if (boardGame.game[boardGameIndex] === ' ') {
        let thisBoard;
        if (boardGame.player === 'user') {
          thisBoard = new PossibleBoard('computer', boardGame.game, boardGame.depth + 1, this.playerX);
        } else {
          thisBoard = new PossibleBoard('user', boardGame.game, boardGame.depth + 1, this.playerX);
        }
        thisBoard.setMove(boardGameIndex);
        result = this.miniMax(thisBoard);
        scores.push(result);
        moves.push(boardGameIndex);
      }
    }

    if (scores.length === 0) {
      return 0;
    }

    if (boardGame.player === 'user') {
      // go through the score array and find the highest to find the best score
      scoreIndex = 0;
      returnScore = -10;
      while (scoreIndex < scores.length) {
        if (scores[scoreIndex] > returnScore) {
          returnScore = scores[scoreIndex];
          this.computerNextMove = moves[scoreIndex];
        }
          scoreIndex++;
        }
      } else {
        scoreIndex = 0;
        returnScore = 10;
        while (scoreIndex < scores.length) {
          if (scores[scoreIndex] < returnScore) {
            returnScore = scores[scoreIndex];
            this.computerNextMove = moves[scoreIndex];
          }
        scoreIndex++;
        }
      }

    return returnScore;
  }


  /**
   * Display the game over dialog which asks the user if they would like to play the game again.
   * If they say no then the board is just cleared off.
   *
   * @param {any} playerMessage
   * @memberof AppComponent
   */
  showGameOverDialog(playerMessage) {

    // Throw up the modal and verify that user wants to delete this phoneRule
    const dialogRef = this.dialog.open(GameOverDialogComponent, {
      data: { computerScore: this.computerScore, userScore: this.userScore },
      disableClose: false
    });
    dialogRef.componentInstance.gameOverString = playerMessage;

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        console.log('user said yes');
        this.startGame();
      } else {
        this.playingGame = false;
        for (let i = 0; i < this.currentBoard.length; i++) {
          this.currentBoard[i] = ' ';
        }
      }

    });

  }

  /**
   * Checks to see if there is a winning row on the board. The consumer calls this after taking a
   * turn, so if the game is won after their turn, it knows that it won.
   *
   * @returns {boolean} Returns true if the game is over, false if not.
   * @memberof AppComponent
   */
  checkGameStatus(): boolean {

    // This gets called every time a turn is taken. It first checks to see if there
    // are 3 in a row and then checks to see if it is a draw. Return value is true
    // if the game is won and false if it is still ongoing.
    let endGame = false;
    let i = 0;
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    while ((!endGame) && (i < wins.length)) {
      if (this.currentBoard[wins[i][0]] !== ' ') {
        // if the first square of a win row is occupied, check to see if this row is a win
        if ((this.currentBoard[wins[i][0]] === this.currentBoard[wins[i][1]]) &&
          (this.currentBoard[wins[i][1]] === this.currentBoard[wins[i][2]])) {
          // This is 3 in a row
          console.log('Three in a row!!!');
          endGame = true;
          return true;
        }
      }
      i++;
    }

    // if there is no Winner, check for a draw
    if (!endGame) {
      console.log('This is not a 3 in a row, see if it is a draw');
      if (this.turnCounter === 9) {
        endGame = true;
        console.log('its a tie!');
        return true;
      }
    }
    return false;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}

/**
 * The dialog that asks the user if they want to play X or O. The value 'X' or 'O' is returned.
 *
 * @export
 * @class ChoiceDialogComponent
 */
@Component({
  selector: 'app-choice-dialog',
  templateUrl: 'app-choice-dialog.html',
})
export class ChoiceDialogComponent {

  chosenPlayLevel = 'easy';
  levels = [
    'easy',
    'hard'
  ];

  constructor(
    public dialogRef: MatDialogRef<ChoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onClose(playerChoice): void {
    this.dialogRef.close({ playerChoice: playerChoice, gameLevel: this.chosenPlayLevel });
  }

}

/**
 * Display the dialog showing that the game is over and asks the user if they want to play again.
 *
 * @export
 * @class GameOverDialogComponent
 */
@Component({
  selector: 'app-gameover-dialog',
  templateUrl: 'app-gameover-dialog.html',
})
export class GameOverDialogComponent {
  public gameOverString: string;
  constructor(
    public dialogRef: MatDialogRef<GameOverDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close('no');
  }

}
