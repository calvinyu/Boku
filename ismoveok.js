/*
 * Grid representation:
 *
 *     0 1 2 3 4 5 6 7 8 9
 *   0 x x x x x
 *   1 x x x x x x
 *   2 x x x x x x x
 *   3 x x x x x x x x
 *   4 x x x x x x x x x
 *   5 x x x x x x x x x x
 *   6   x x x x x x x x x
 *   7     x x x x x x x x
 *   8       x x x x x x x
 *   9         x x x x x x
 *  10           x x x x x  
 */

//the number of consecutive pawns to win
var N = 3;

var horIndex = [[0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
	[1, 10], [2, 10], [3, 10], [4, 10], [5, 10]];
var verIndex = [[0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
	[1, 11], [2, 11], [3, 11], [4, 11], [5, 11]];
// starting povar from NW side, end at row==10 or col==9
var tilIndex = [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0],
	[2, 0], [3, 0], [4, 0], [5, 0]];

console.log("#ismoveok.js");
/*jslvar devel: true, indent: 2 */
/*global console */
var isMoveOk = (function () {
	//Defines that JavaScript code should be executed in "strict mode".
	'use strict';

	function isEqual(object1, object2) {
		console.log(JSON.stringify(object1));
		console.log(JSON.stringify(object2));
		
		return JSON.stringify(object1) === JSON.stringify(object2);
	}

	function copyObject(object) {
		return JSON.parse(JSON.stringify(object));
	}

	/** Return the winner (either 'R' or 'Y') or '' if there is no winner. */
	function getWinner(board) {
		//check left to right
		var i, cnt, j;
		for(i=0; i<11; ++i) {
			cnt = 0;
			for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
				if(board[i][j] !== ''){
					if(j===0 || board[i][j-1] === board[i][j]){
						cnt++;
					}
					else{
						cnt = 1;
					}
					if( cnt === N ){
						console.log('hor');
						return board[i][j];
					}
				}
			}
		}

		//check NE<->SW
		for(j=0; j<10; ++j){
			cnt = 0;
			for(i=verIndex[j][0]; i<verIndex[j][1]; ++i){
				if(board[i][j] !== ''){
					if(i===0 || board[i-1][j] === board[i][j]){
						cnt++;
					}
					else{
						cnt = 1;
					}
					if( cnt === N ){
						console.log('ver');
						return board[i][j];
					}

				}
			}
		}
		var row, col;
		//check NW<->SE
		for(i=0; i<10; ++i) {
			cnt =0;
			for(row = tilIndex[i][0], col = tilIndex[i][1]; row<11 && col<10; row++, col++){
				if(board[row][col] !== ''){
					if(row === 0 || col===0 || board[row][col]===board[row-1][col-1]){
						cnt++;
					}
					else{
						cnt = 1;
					}
					if(cnt === N){
					
						console.log('til');
						return board[row][col];
					}
				}
			}

		}
		
		return '';
	}//Done

	/** Returns true if the game ended in a tie because there are no empty cells. */
	function isTie(board) {
		var i,j;
		for(i=0; i<11; ++i) {
			for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
				if(board[i][j] === ''){
					return false;
				}
			}
		}
		console.log('tie');
		return true;
	}//Done

	/** 
	 * Returns the move that should be performed when player 
	 * with index turnIndexBeforeMove makes a move in cell row X col. 
	 */
	function createMove(board, row, col, turnIndexBeforeMove) {
		var boardAfterMove = copyObject(board);
		// first one should be Red
		boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'Y';
		var winner = getWinner(boardAfterMove);
		var firstOperation;
		if (winner !== '' || isTie(board)) {
			// Game over.
			console.log('winner' + winner);
			firstOperation = {endMatch: {endMatchScores: 
				(winner === 'R' ? [1, 0] : (winner === 'Y' ? [0, 1] : [0, 0]))}};
		} else {
			// Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
			firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
		}
		return [firstOperation,
			   {set: {key: 'board', value: boardAfterMove}},
			   {set: {key: 'delta', value: {row: row, col: col}}}];
	}//done

	function isMoveOk(params) {
		var move = params.move; 
		var turnIndexBeforeMove = params.turnIndexBeforeMove; 
		var stateBeforeMove = params.stateBeforeMove; 
		var i, j;
		// The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
		//var turnIndexAfterMove = params.turnIndexAfterMove; 
		//var stateAfterMove = params.stateAfterMove; 

		// We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
		// to verify that move is legal.
		try {
			// Example move:
			// [{setTurn: {turnIndex : 1},
			//  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
			//  {set: {key: 'delta', value: {row: 0, col: 0}}}]
			var deltaValue = move[2].set.value;
			var row = deltaValue.row;
			var col = deltaValue.col;
			var board = stateBeforeMove.board;
			if (board === undefined) {
				// Initially (at the beginning of the match), stateBeforeMove is {}. 
				board = new Array(11);
				for( i=0; i<11; ++i){
					board[i] = new Array(10);
					for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
						board[i][j] = '';
					}
				}
			}
			// One can only make a move in an empty position 
			if (board[row][col] !== '') {
				console.log(board[row][col]);
				return false;
			}
			var expectedMove = createMove(board, row, col, turnIndexBeforeMove);
			if (!isEqual(move, expectedMove)) {
				console.log(2);
				return false;
			}
		} catch (e) {
			// if there are any exceptions then the move is illegal
			console.log(e+3);
			return false;
		}
		return true;
	}
			var i, j;
			var board = new Array(11);
			for(i=0; i<11; ++i){
				board[i] = new Array(10);
				for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
					board[i][j] = '';
				}
			}
			board[0][0] = 'R';
			var board2 = copyObject(board);
			board2[0][1] = 'Y';
		// "Manual testing" --- expected result is [true, true, true, false].
		console.log(
				[ // Check placing X in 0x0 from initial state.
				isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {}, 
					move: [{setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: board}},
				{set: {key: 'delta', value: {row: 0, col: 0}}}]}),
				// Check placing O in 0x1 from previous state.   
				isMoveOk({turnIndexBeforeMove: 1, 
					stateBeforeMove: {board: board, delta: {row: 0, col: 0}}, 
				move: [{setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: board2}},
				{set: {key: 'delta', value: {row: 0, col: 1}}}]}),
				// Checking an illegal move.
				isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {}, move: [{setTurn: {turnIndex : 0}}]})
				]);

		return isMoveOk;
	})();

