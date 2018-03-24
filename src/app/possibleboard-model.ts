export class PossibleBoard {

    player: string;
    game: string[];
    depth: number;
    XorO: string;
    playerX: boolean;

    constructor(player: string, game: string[], depth: number, playerX: boolean) {

        this.player = player;
        this.game = game;
        this.depth = depth;
        this.playerX = playerX;

        // Player is either "computer" or "user"
        if (this.player === 'user') {
            if (playerX) {
                this.XorO = 'X';
            } else {
                this.XorO = 'O';
            }
        } else {
            if (playerX) {
                this.XorO = 'O';
            } else {
            this.XorO = 'X';
            }
        }
    }

    consoleMe() {
        console.log('This board is for ' + this.player + ' who is playing as ' + this.XorO);
        console.log(this.game);
    }

    setMove(arg) {

        if (this.XorO === 'X') {
            this.game[arg] = 'X';
        } else {
            this.game[arg] = 'O';
        }

    }

    threeInaRow() {
        // Given the array board passed to this function,
        // for this player (who is X or O), tell me if they won
        let i = 0;
        let result = ' ';
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

        while (i < wins.length) {
            if (this.game[wins[i][0]] !== ' ') {
                // if the first square of a win row is occupied, check to see if this row is a win
                if ((this.game[wins[i][0]] === this.game[wins[i][1]]) && (this.game[wins[i][1]] === this.game[wins[i][2]])) {
                    result = this.game[wins[i][0]];
                }
            }
            i++;
        }
        return result;
    }

    scoreGame() {

    let retScore = 0;
    const retCode = this.threeInaRow();

    if (retCode === ' ') { // neither x nor o won
        retScore = 0;
        return retScore;
    }

    if (retCode === 'X') { // X got a 3 in a row
        if (this.player === 'computer') {
            if (this.XorO === 'X') {
                retScore = 10;
            } else {
                retScore = -10;
            }
        } else { // this.player === "user"
            if (this.XorO === 'X') {
                retScore = -10;
            } else {
                retScore = 10;
            }
        }
    } else { // "o" got three in a row
        if (this.player === 'computer') {
            if (this.XorO === 'X') {
                retScore = -10;
            } else {
                retScore = 10;
            }
        } else { // this.player === "user"
            if (this.XorO === 'X') {
                retScore = 10;
            } else {
                retScore = -10;
            }
        }
    }
    return retScore;
   }
}
