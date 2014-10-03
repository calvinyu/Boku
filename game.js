'use strict';

// TODO: remove stateService before launching the game.
angular.module('myApp',
    ['myApp.messageService', 'myApp.gameLogic', 'platformApp'])
  .controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic) {

    function updateUI(params) {
      $scope.jsonState = angular.toJson(params.stateAfterMove, true);
      $scope.board = params.stateAfterMove.board;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.setBoard();
      }
    }
    updateUI({stateAfterMove: {}});
    var game = {
      gameDeveloperEmail: "ycy247@nyu.edu",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles()
    };

    var isLocalTesting = $window.location.origin === "file://";
    $scope.move = "[{setTurn: {turnIndex: 1}}, {set: {key: 'board', value:";
    this.temp = gameLogic.setBoard();
    this.temp[0][0] = 'R';
    $scope.move += JSON.stringify(this.temp);
    $scope.move += "}}, {set: {key: 'delta', value: {row: 0, col: 0, delDirRow:0, delDirCol:0, delDis:0}}}]";
    $scope.makeMove = function () {
      $log.info(["Making move:", $scope.move]);
      var moveObj = eval($scope.move);
      if (isLocalTesting) {
        stateService.makeMove(moveObj);
      } else {
        messageService.sendMessage({makeMove: moveObj});
      }
    };

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
