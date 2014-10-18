'use strict';
// TODO: remove stateService before launching the game.
angular.module('myApp',['ngTouch']).controller('Ctrl', function (
      $window, $scope, $log,$timeout,
      gameService, scaleBodyService, gameLogic, hexagon) {
    //setting up canvas
    var ctrl = this;
    console.log("b4");
    $scope.board = gameLogic.setBoard();
    console.log("after");
    hexagon.HexagonGrid("HexCanvas", 50);
    //hexagon.drawHexGrid(gameLogic.horIndex, 30, 30, false, $scope.board);
    //var isLocalTesting = $window.parent === $window;
    var moveAudio = new Audio('audio/small_gun.mp3');
    moveAudio.load();
    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      $scope.delta = params.stateAfterMove.delta;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.setBoard();
      }
      else{
        moveAudio.play();  
      }
      hexagon.drawHexGrid(gameLogic.horIndex, 30, 30, false, $scope.board);
      
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;
      // Is it the computer's turn?
      hexagon.turn = params.yourPlayerIndex;
      if ($scope.isYourTurn
          && params.playersInfo[params.yourPlayerIndex].playerId === '') {
        // Wait 500 milliseconds until animation ends.
        $timeout(sendComputerMove, 500);
      }
    }

    function sendMakeMove(move) {
      $log.info(["Making move:", move]);
      gameService.makeMove(move);
    }
    function sendComputerMove() {
      var move = gameLogic.createComputerMove($scope.board, $scope.turnIndex);
      gameService.makeMove(move);

      hexagon.column = move[2].set.value.col - move[2].set.value.row + 5;
      hexagon.row = parseInt((-4+hexagon.column+2*move[2].set.value.row)/2, 10);

    }
    // Before getting any updateUI message, we show an empty board to a viewer (so you can't perform moves).
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    
    $scope.cellClicked = function (e) {
      e = e.changedTouches[0];
      var position = getRowCol(e.clientX, e.clientY);
      console.log("x,y",e);
      tryMakeMove(position.x, position.y);
    }
    function getRowCol(x,y) {
      hexagon.tx = scaleBodyService.tx;
      hexagon.ty = scaleBodyService.ty;
      hexagon.scale = scaleBodyService.scale;
      hexagon.getIndex(x,y);
      ctrl.offX = hexagon.offSetX;
      ctrl.offY = hexagon.offSetY;
      var row = parseInt((5-hexagon.column+2*hexagon.row)/2, 10);
      var col = row + hexagon.column - 5;
      ctrl.x = x;
      ctrl.y = y;

      ctrl.row = row;
      ctrl.column = col;

      $log.info(["Clicked on cell:", row, col]);

      console.log("dehub:",$scope.isYourTurn);
      if (!$scope.isYourTurn) {
        return;
      }

      console.log("cur dehug:",col,row);
      return {x:row, y:col};
    };
    function tryMakeMove(row, col){
      try {
        var move = gameLogic.createMove($scope.board, row, col,0,0,0, $scope.turnIndex);
        $scope.isYourTurn = false;
        console.log(move);
        sendMakeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col, e.message]);
        return;
      }
    };

    scaleBodyService.scaleBody({width: 1000, height: 1100});

    gameService.setGame({
      gameDeveloperEmail: "ycy247@nyu.edu",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles(),
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });

  });
