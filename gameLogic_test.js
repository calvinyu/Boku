describe("In Boku ", function() {
	var bokuLogic;
	beforeEach(module("myApp.gameLogic"));
	beforeEach(inject(function(gameLogic){
		bokuLogic = gameLogic;
	}));
	/**
	 * board initialization
	 * @param pawn:a character that represent the initial pawn that 
	 *             will be place at every position('Y', 'R', or '')
	 * @return board: a two dimensional array that represent the board  
	 */
	function setBoard(){
		return bokuLogic.setBoard();
	}
	function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
		expect(bokuLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
			stateBeforeMove: stateBeforeMove,
			move: move})).toBe(true);
	}

	function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
		expect(bokuLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
			stateBeforeMove: stateBeforeMove,
		move: move})).toBe(false);
	}
	//Initial move
	it("placing R in 0x0 from initial state is legal",function() {
		var board = setBoard();
		board[0][0] = 'R';
		expectMoveOk(0,{},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:board}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});

	//Removing test
	it("placing R in 0x0 and remove 0x1 of Y is legal",function() {
		var board = setBoard();
		board[0][1] = 'Y';
		board[0][2] = 'Y';
		board[0][3] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		nextBoard[0][1] = '';
		expectMoveOk(0,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:1,delDis:1}}}
			]);		
	});

	it("placing R in 0x0 and remove 0x1 of R is illegal",function() {
		var board = setBoard();
		board[0][1] = 'R';//should be Y
		board[0][2] = 'Y';
		board[0][3] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		nextBoard[0][1] = '';
		expectIllegalMove(0,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:1,delDis:1}}}
			]);		
	});
	
	it("placing R in 0x0 and remove 0x4 of Y is  illegal",function() {
		var board = setBoard();
		board[0][1] = 'Y';
		board[0][2] = 'Y';
		board[0][3] = 'R';
		board[0][4] = 'Y';//are not trapped
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		nextBoard[0][4] = '';
		expectIllegalMove(0,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:1,delDis:4}}}
			]);		
	});

	it("placing R in 0x0 and remove 0x-1 of Y is  illegal",function() {
		var board = setBoard();//0 x -1 is out of bound
		board[0][1] = 'Y';
		board[0][2] = 'Y';
		board[0][3] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		expectIllegalMove(0,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:-1,delDis:1}}}
			]);		
	});  

	it("placing R in 0x0 and remove 0x1 of Y but not trapped is illegal",function() {
		var board = setBoard();
		board[0][1] = 'Y';
		board[0][2] = 'R';//should be Y
		board[0][3] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		nextBoard[0][1] = '';
		expectIllegalMove(0,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:1,delDis:1}}}
			]);		
	});
	
	it("placing Y in 0x0 and remove 0x1 of R but not trapped is illegal",function() {
		var board = setBoard();
		board[0][1] = 'R';
		board[0][2] = 'R';
		board[0][3] = 'R';//should be Y
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'Y';
		nextBoard[0][1] = '';
		expectIllegalMove(1,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:0}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:1,delDis:1}}}
			]);		
	});

	it("placing R in 0x0 and remove but having wrong after move is illegal",function() {
		var board = setBoard();
		board[0][1] = 'Y';
		board[0][2] = 'Y';
		board[0][3] = 'R';//should be R
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		nextBoard[0][1] = 'Y';
		expectIllegalMove(0,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:1}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:1,delDis:1}}}
			]);		
	});

	it("placing R in 1x0 that was removed last time",function() {
		var board = setBoard();
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[1][0] = 'R';
		expectIllegalMove(1,{board:board,delta:{row:0,col:0,delDirRow:1,delDirCol:0,delDis:1}},[
			{setTurn:{turnIndex:0}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}}}
			]);		
	});

	//Legal moves
	it("check placing Y in 0x1 from previous state",function() {
		var board = setBoard();
		board[0][0] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][1] = 'Y';
		expectMoveOk(1,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:0}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:1,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});

	it("R wins by placing X in 0x2 is legal",function() {
		var board = setBoard();
		board[0][0] = 'R';
		board[0][1] = 'R';
		board[0][3] = 'R';
		board[0][4] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][2] = 'R';
		expectMoveOk(0,{board:board,delta:{row:1,col:1,delDirRow:0,delDirCol:0,delDis:0}},[
			{endMatch:{endMatchScores:[1,0]}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:2,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});

	it("Y wins by placing X in 1x2 is legal",function() {
		var board = setBoard();
		board[5][2] = 'Y';
		board[2][2] = 'Y';
		board[3][2] = 'Y';
		board[4][2] = 'Y';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[1][2] = 'Y';
		expectMoveOk(1,{board:board,delta:{row:1,col:1,delDirRow:0,delDirCol:0,delDis:0}},[
			{endMatch:{endMatchScores:[0,1]}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:1,col:2,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});


	it("Y wins by placing X in 1x2 is legal, the third direction",function() {
		var board = setBoard();
		board[2][3] = 'Y';
		board[3][4] = 'Y';
		board[4][5] = 'Y';
		board[5][6] = 'Y';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[1][2] = 'Y';
		expectMoveOk(1,{board:board,delta:{row:1,col:1,delDirRow:0,delDirCol:0,delDis:0}},[
			{endMatch:{endMatchScores:[0,1]}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:1,col:2,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});
	//Tie
	function setTieBoard(){
		var i, j;
		var board = new Array(11);
		for(i=0; i<11; ++i){
			board[i] = new Array(10);
			for(j=bokuLogic.horIndex[i][0];j<bokuLogic.horIndex[i][1]; ++j){
				if((i*2+j)%4<2) board[i][j] = 'R';
				else board[i][j] = 'Y';
			}
		}
		return board;
	}
	
	it("the game ties when there are no more empty cells",function() {
		var board = setTieBoard();
		board[1][1] = '';//should be Y because 1*2+1 > 2
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[1][1] = 'Y';
		expectMoveOk(1,{board:board,delta:{row:1,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{endMatch:{endMatchScores:[0,0]}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:1,col:1,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});

	//Illegal moves
	it("placing an R in a non-empty position is illegal",function() {
		var board = setBoard();
		board[0][0] = 'R';
		var nextBoard = bokuLogic.copyObject(board);
		nextBoard[0][0] = 'R';
		expectIllegalMove(1,{board:board,delta:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}},[
			{setTurn:{turnIndex:0}},
			{set:{key:'board',value:nextBoard}},
			{set:{key:'delta',value:{row:0,col:0,delDirRow:0,delDirCol:0,delDis:0}}}
			]);	
	});
	
	it("null move is illegal",function() {
		expectIllegalMove(0,{},null);
	});

	it("move without board is illegla", function(){
		expectIllegalMove(0,{},[{setTurn:{turnIndex:1}}]);
	});

	it("move without delta is illegal", function(){
		var board = setBoard();
		expectIllegalMove(0,{}, [
			{setTurn:{turnIndex:1}},
			{set:{key:'board', value:board
				 }}]);
	});
	
	it("placing R outside the board (@10x10) is illegal", function(){
		var board = setBoard();
		board[10][10] = 'R';
		expectIllegalMove(0,{},[{setTurn:{turnIndex:1}},
			{set:{key:'board', value:board}},
			{set:{key:'delta', value:{row:10, col:10}}}]);
	});

	it("placing R in 0x0 but setTurn to yourself is illegal", function() {
		var board = setBoard();
		board[0][0] = 'R';
		expectIllegalMove(0, {}, [{setTurn: {turnIndex : 0}},
			{set: {key: 'board', value:
					  board}},
					  {set: {key: 'delta', value: {row: 0, col: 0, delDirRow:0, delDirCol:0, delDirDis:0}}}]);
	});

	it("placing R in 0x0 but setting the board wrong is illegal", function() {
		var board = setBoard();
		expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
			{set: {key: 'board', value:
					  board}},
					  {set: {key: 'delta', value: {row: 0, col: 0}}}]);
	});
	
	// Example moves function and test
	function expectLegalHistoryThatEndsTheGame(history) {
		for (var i = 0; i < history.length; i++) {
			expectMoveOk(history[i].turnIndexBeforeMove,
					history[i].stateBeforeMove,
					history[i].move);
		}
		expect(history[history.length - 1].move[0].endMatch).toBeDefined();
	}

	function expectLegalHistoryThatDoesNotEndsTheGame(history) {
		for (var i = 0; i < history.length; i++) {
			expectMoveOk(history[i].turnIndexBeforeMove,
					history[i].stateBeforeMove,
					history[i].move);
		}
	}
	
	it("getExampleGame returns a legal history and the last move ends the game", function() {
		var exampleGame = bokuLogic.getExampleGame();
		expect(exampleGame.length).toBe(8);
		expectLegalHistoryThatDoesNotEndsTheGame(exampleGame);
	});
	
	
  it("getRiddles returns legal histories where the last move ends the game", function() {
    var riddles = bokuLogic.getRiddles();
    expect(riddles.length).toBe(1);
    for (var i = 0; i < riddles.length; i++) {
      expectLegalHistoryThatEndsTheGame(riddles[i]);
    }
  });
	
});
