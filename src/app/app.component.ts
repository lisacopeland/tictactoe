import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  playingGame = false;
  title = 'app';
  playerChoice = 'O';
  playerX = false;
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

  private _mobileQueryListener: () => void;

  constructor(public changeDetectorRef: ChangeDetectorRef,
              public media: MediaMatcher,
              public dialog: MatDialog,
              public snackBar: MatSnackBar) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

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
          // the player didn't win so let the computer take a turn
          this.showGameOverDialog('You Win!!!!');
        } else {
          this.computerChoice();
        }
      }
    }
  }

  getRandomIntInclusive(min, max) {
    // Helper function that returns a random number between min & max
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

  getPlayerChoice(): void {
    const dialogRef = this.dialog.open(ChoiceDialogComponent, {
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.playerChoice = result;
      console.log('Player picked :' + this.playerChoice);
      this.openSnackBar('It\'s your turn!', 'Put an ' + this.playerChoice + ' in any square.');
      this.playerX = (this.playerChoice === 'X') ? true : false;
      if (!this.playerX) {
          this.computerChoice();
      }
    });
  }

  computerChoice() {

      const myChoice = this.computerPick();

      this.turnCounter++;
      if (this.playerX) {
        this.currentBoard[myChoice] = 'O';
      } else {
        this.currentBoard[myChoice] = 'X';
      }
      if (this.checkGameStatus()) {
        this.showGameOverDialog('I Win!!!!');
      } else {
        this.openSnackBar('It\'s your turn!', 'Put an ' + this.playerChoice + ' in any square.');
      }
  }

  computerPick() {

    let validChoice = false;
    let tryOne = 0;

    while (!validChoice) {
      tryOne = this.getRandomIntInclusive(0, 8);
      if (this.currentBoard[tryOne] === ' ') {
        validChoice = true;
      }
      return(tryOne);
    }
  }

  showGameOverDialog(playerMessage) {

    // Throw up the modal and verify that user wants to delete this phoneRule
    const dialogRef = this.dialog.open(GameOverDialogComponent, {
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
        console.log ('This is not a 3 in a row, see if it is a draw');
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

@Component({
  selector: 'app-choice-dialog',
  templateUrl: 'app-choice-dialog.html',
})
export class ChoiceDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ChoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onChoice(choice): void {
    this.dialogRef.close();
  }

}

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
