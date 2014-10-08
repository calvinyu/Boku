angular.module('myApp.gameLogic', []).service('gameLogic', function(){
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

/* Grid representation:
 *
 *     0 1 2 3 4 5 6 7 8 9
 *   0       x x x 
 *   1   x x x x x x x
 *   2 x x x x x x x x x
 *   3 x x x x x x x x x
 *   4 x x x x x x x x x
 *   5 x x x x x x x x x  
 *   6 x x x x x x x x x 
 *   7     x x x x x     
 *   8         x         
 *   9                  
 *  10                    
 */


//the number of consecutive pawns to win
var N = 5;
//the boundary of horizontal direction
var horIndex = [[0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
	[1, 10], [2, 10], [3, 10], [4, 10], [5, 10]];
//the boundary of vertical direction
var verIndex = [[0, 6], [0, 7], [0, 8], [0, 9], [0, 10],
	[1, 11], [2, 11], [3, 11], [4, 11], [5, 11]];
//the boundary of diagonal direction
// starting point from NW side, end at row==10 or col==9
var tilIndex = [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0],
	[2, 0], [3, 0], [4, 0], [5, 0]];

/*jslvar devel: true, indent: 2 */
/*global console */
	//Defines that JavaScript code should be executed in "strict mode".
	'use strict';
	function isEqual(object1, object2) {
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
						return board[row][col];
					}
				}
			}
		}
		return '';
	}//Done
  function isInsideBoard(row,col) {
    return (row>=0 && row<=10) && (horIndex[row][0] <= col) && (col < howIndex[row][1]);
  }

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
		return true;
	}//Done

	/** 
	 * Returns the move that should be performed when player 
	 * with index turnIndexBeforeMove makes a move in cell row X col. 
	 */
	function createMove(board, row, col, delDirRow, delDirCol, delDis, turnIndexBeforeMove) {
		console.log(row, col);
		if(board === undefined) board = setBoard();
		if (board[row][col] !== '') {
      	throw new Error("One can only make a move in an empty position!");
    	}
		var boardAfterMove = copyObject(board);
		// first one should be Red
		boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'Y';
		//remove one of the opponent's pawn
		if(delDis !== 0) {
			boardAfterMove[row+delDirRow*delDis][col+delDirCol*delDis] = '';
		}
		
		var winner = getWinner(boardAfterMove);
		var firstOperation;
		if (winner !== '' || isTie(boardAfterMove)) {
			// Game over.
			firstOperation = {endMatch: {endMatchScores: 
				(winner === 'R' ? [1, 0] : (winner === 'Y' ? [0, 1] : [0, 0]))}};
		} else {
			// Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
			firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
		}
		return [firstOperation,
			   {set: {key: 'board', value: boardAfterMove}},
			   {set: {key: 'delta', value: {row: row, col: col, delDirRow: delDirRow, delDirCol: delDirCol, delDis: delDis}}}];
	}//done

	function isMoveOk(params) {
		var move = params.move; 
		var turnIndexBeforeMove = params.turnIndexBeforeMove; 
		var stateBeforeMove = params.stateBeforeMove; 
		var i, j;
		try {
			var deltaValue = move[2].set.value;
			var row = deltaValue.row;
			var col = deltaValue.col;
			// the row direction of the pawn that's going to be removed relative to row
			// i.e. direction of (removedRow - row)
			var delDirRow = deltaValue.delDirRow;
			// the column direction of the pawn that's going to be removed relative to col
			// i.e. direction of (removedColumn - column)
			var delDirCol = deltaValue.delDirCol;
			// the distance of the pawn that's going to be removed relative to row/column
			// i.e. abs(removedRow - row + removedCol - col)
			var delDis = deltaValue.delDis;
			var board = stateBeforeMove.board;
			var rowBeforeMove = stateBeforeMove.row;
			var colBeforeMove = stateBeforeMove.col;
			var delDisBeforeMove = stateBeforeMove.delDis;
			var delDirRowBeforeMove = stateBeforeMove.delDirRow;
			var delDirColBeforeMove = stateBeforeMove.delDirCol;
			var delRow = rowBeforeMove + delDisBeforeMove*delDirRowBeforeMove;
			var delCol = colBeforeMove + delDisBeforeMove*delDirColBeforeMove;
			if (board === undefined) {
				// Initially (at the beginning of the match), stateBeforeMove is {}. 
				board = setBoard();
			}
			// One can't place at a position that was taken at last move.
			if(delDis!==0 && delDisBeforeMove !== 0 && delDirRow === row && delDirCol === col) {
				return false;
			}
			// Only when the opponents pawn is trapped can be removed.
			if(delDis !== 0){
				if(delDis > 2 || delDis < 0){
					return false;
				}
				if(row+3*delDirRow < 0 || col+3*delDirCol < 0){
					return false;
				}
				if(board[row+delDirRow][col+delDirCol] !== (turnIndexBeforeMove===0?'Y':'R') ){
					return false;
				}
				if(board[row+2*delDirRow][col+2*delDirCol] !== (turnIndexBeforeMove===0?'Y':'R') ){
					return false;
				}
				if(board[row+3*delDirRow][col+3*delDirCol] !== (turnIndexBeforeMove===0?'R':'Y') ){
					return false;
				}
			}
			var expectedMove = createMove(board, row, col, delDirRow, delDirCol, delDis, turnIndexBeforeMove);
			if (!isEqual(move, expectedMove)) {
				return false;
			}
		} catch (e) {
			// if there are any exceptions then the move is illegal
			return false;
		}
		return true;
	}
	
	/** Returns an array of {stateBeforeMove, move, comment}. */
  function getExampleMoves(initialTurnIndex, initialState, arrayOfRowColComment) {
    var exampleMoves = [];
    var state = initialState;
    var turnIndex = initialTurnIndex;
    for (var i = 0; i < arrayOfRowColComment.length; i++) {
      var rowColComment = arrayOfRowColComment[i];
      var move = createMove(state.board, rowColComment.row, rowColComment.col, rowColComment.delDirRow, rowColComment.delDirCol, rowColComment.delDis, turnIndex);
      var stateAfterMove = {board : move[1].set.value, delta: move[2].set.value};
      exampleMoves.push({
        stateBeforeMove: state,
        stateAfterMove: stateAfterMove,
        turnIndexBeforeMove: turnIndex,
        turnIndexAfterMove: 1 - turnIndex,
        move: move,
        comment: {en: rowColComment.comment}});
        
      state = stateAfterMove;
      turnIndex = 1 - turnIndex;
    }
    return exampleMoves;
  }

  function getExampleGame() {
    return getExampleMoves(0, {}, [
      {row: 5, col: 5, delDirRow:0, delDirCol:0, delDis:0,  comment: "R put at middle of the board"},
      {row: 5, col: 6, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y put next to it(trying to block it)"},
      {row: 4, col: 5, delDirRow:0, delDirCol:0, delDis:0,  comment: "R put one on it's neighbor to form two in a row"},
      {row: 3, col: 5, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y tries to block one side of R"},
      {row: 4, col: 6, delDirRow:0, delDirCol:0, delDis:0,  comment: "R forms another line on another direction"},
      {row: 3, col: 7, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y blocks one side of R's new line"},
      {row: 6, col: 4, delDirRow:0, delDirCol:0, delDis:0,  comment: "R extends the line by adding one on the other direction"},
      {row: 7, col: 3, delDirRow:0, delDirCol:0, delDis:0,  comment: "Y blocks the other direction as well"}
    ]);
  }
  
    function getRiddles() {
    
    var board = setBoard();
    board[5][3] = 'R';
    board[5][4] = 'R';
    board[5][5] = 'R';
    
    
    board[6][7] = 'Y';
    board[6][3] = 'Y';
    board[1][3] = 'Y';
    board[4][4] = 'Y';
    
    return [
      getExampleMoves(0,
        {
          board:board,
          delta: {row: 4, col: 4, delDirRow:0, delDirCOl:0, delDis:0}
        },
        [
        {row: 5, col: 6, delDirRow:0, delDirCol:0, delDis:0, comment: "Find the position for R where he could win in his next turn at either side of a 4-in-a-row line"},
        {row: 5, col: 7, delDirRow:0, delDirCol:0, delDis:0, comment: "Y played at the right end"},
        {row: 5, col: 2, delDirRow:0, delDirCol:0, delDis:0, comment: "R wins by having three R at the right side of the line."}
      ])]

  }

  
		function setBoard(){
			var i, j;
			var board = new Array(11);
			for(i=0; i<11; ++i){
				board[i] = new Array(10);
				for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
					board[i][j] = '';
				}
			}
			return board;
		}

		// "Manual testing" --- expected result is [true, true, false].
			board = setBoard();
			board[0][0] = 'R';
			var board2 = copyObject(board);
			board2[0][1] = 'Y';		
		console.log(
				[ // Check placing X in 0x0 from initial state.
				isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {}, 
					move: [{setTurn: {turnIndex : 1}},
				{set: {key: 'board', value: board}},
				{set: {key: 'delta', value: {row: 0, col: 0, delDirRow:0, delDirCol:0, delDis:0}}}]}),
				// Check placing O in 0x1 from previous state.   
				isMoveOk({turnIndexBeforeMove: 1, 
					stateBeforeMove: {board: board, delta: {row: 0, col: 0, delDirRow:0, delDirCol:0, delDis:0}}, 
				move: [{setTurn: {turnIndex : 0}},
				{set: {key: 'board', value: board2}},
				{set: {key: 'delta', value: {row: 0, col: 1, delDirRow:0, delDirCol:0, delDis:0}}}]}),
				// Checking an illegal move.
				isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {}, move: [{setTurn: {turnIndex : 0}}]})
				]);

		this.isMoveOk=isMoveOk;
		this.horIndex = horIndex;
		this.copyObject = copyObject;
		this.getExampleGame = getExampleGame;
		this.setBoard = setBoard;
		this.getRiddles = getRiddles;
    this.createMove = createMove;
    this.board = setBoard();
});
