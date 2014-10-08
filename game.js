'use strict';

// TODO: remove stateService before launching the game.
angular.module('myApp',
    ['myApp.messageService', 'myApp.gameLogic', 'myApp.scaleBodyService',
     'platformApp', 'myApp.hexagon'])
  .controller('Ctrl', function (
      $window, $scope, $log,
      messageService, scaleBodyService, stateService, gameLogic, hexagon) {
    console.log("what are you?");

    hexagon.HexagonGrid("HexCanvas", 50);
    hexagon.drawHexGrid(11, 11, 30, 30, true);
    var isLocalTesting = $window.parent === $window;

    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.setBoard();
      }
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;
      console.log("test");
      hexagon.updateUI($scope.turnIndex);
    }

    function sendMakeMove(move) {
      $log.info(["Making move:", move]);
      if (isLocalTesting) {
        stateService.makeMove(move);
      } else {
        messageService.sendMessage({makeMove: move});
      }
    }

    // Before getting any updateUI message, we show an empty board to a viewer (so you can't perform moves).
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    var game = {
      gameDeveloperEmail: "yoav.zibin@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles()
    };
    $scope.cellClicked = function (e) {
      console.log('start drawing');
      hexagon.getIndex(e);
      console.log("done drawing");
      
      var row = parseInt((5-hexagon.column+2*hexagon.row)/2, 10);
      var col = row + hexagon.column - 5;
      $log.info(["Clicked on cell:", row, col]);
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        var move = gameLogic.createMove($scope.board, row, col,0,0,0, $scope.turnIndex);
        $scope.isYourTurn = false; // to prevent making another move
        // TODO: show animations and only then send makeMove.
        console.log($scope.move);
        sendMakeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col, e.message]);
        return;
      }
    };

    //scaleBodyService.scaleBody({width: 152, height: 152});

    if (isLocalTesting) {
      game.isMoveOk = gameLogic.isMoveOk;
      game.updateUI = updateUI;
      stateService.setGame(game);
    } else {
      messageService.addMessageListener(function (message) {
        if (message.isMoveOk !== undefined) {
          var isMoveOkResult = gameLogic.isMoveOk(message.isMoveOk);
          messageService.sendMessage({isMoveOkResult: isMoveOkResult});
        } else if (message.updateUI !== undefined) {
          updateUI(message.updateUI);
        }
      });

      messageService.sendMessage({gameReady : game});
    }
  });
