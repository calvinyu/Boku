'use strict';

angular.module('myApp.hexagon',[]).service('hexagon', function($window) {
    // Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html
    var hex = this;
    this.HexagonGrid = function(canvasId, radius) {
        hex.radius = radius;

        hex.height = Math.sqrt(3) * radius;
        hex.width = 2 * radius;
        hex.side = (3 / 2) * radius;

        hex.canvas = document.getElementById(canvasId);
        hex.context = hex.canvas.getContext('2d');

        hex.canvasOriginX = 0;
        hex.canvasOriginY = 0;
        
    };

    this.drawHexGrid = function (hor, originX, originY, isDebug, board) {
        hex.canvasOriginX = originX;
        hex.canvasOriginY = originY;
        
        var currentHexX;
        var currentHexY;
        var debugText = "";

        var offsetColumn = false;

        for (var col = 0; col < 12; col++) {
            for (var row = 0; row < 12; row++) {
                var x = parseInt((5-col+2*row)/2, 10);
                if(5-col+2*row<0) x = 1000;
                var y = x + col - 5;
                if (!offsetColumn) {
                    currentHexX = (col * hex.side) + originX;
                    currentHexY = (row * hex.height) + originY;
                } else {
                    currentHexX = col * hex.side + originX;
                    currentHexY = (row * hex.height) + originY + (hex.height * 0.5);
                }
                if (isDebug) {
                    debugText = currentHexY;
                }
                if(x>=0 && x<11){
                    if(board[x][y] == 'R')
                        hex.drawHex(currentHexX, currentHexY, "#e00", debugText);
                    else if (board[x][y] == 'Y')
                        hex.drawHex(currentHexX, currentHexY, "#0ee", debugText);
                    else if( board[x][y] == '')
                        hex.drawHex(currentHexX, currentHexY, "#ddd", debugText);
                }
            }
            offsetColumn = !offsetColumn;
        }
    };

    this.drawHexAtColRow = function(column, row, color) {
        var drawy = column % 2 == 0 ? (row * hex.height) + hex.canvasOriginY : (row * hex.height) + hex.canvasOriginY + (hex.height / 2);
        var drawx = (column * hex.side) + hex.canvasOriginX;
        hex.drawHex(drawx, drawy, color, "");
    };

    this.drawHex = function(x0, y0, fillColor, debugText) {
        hex.context.strokeStyle = "#000";
        hex.context.beginPath();
        hex.context.moveTo(x0 + hex.width - hex.side, y0);
        hex.context.lineTo(x0 + hex.side, y0);
        hex.context.lineTo(x0 + hex.width, y0 + (hex.height / 2));
        hex.context.lineTo(x0 + hex.side, y0 + hex.height);
        hex.context.lineTo(x0 + hex.width - hex.side, y0 + hex.height);
        hex.context.lineTo(x0, y0 + (hex.height / 2));

        if (fillColor) {
            hex.context.fillStyle = fillColor;
            hex.context.fill();
        }

        hex.context.closePath();
        hex.context.stroke();

        if (debugText) {
            hex.context.font = "8px";
            hex.context.fillStyle = "#000";
            hex.context.fillText(debugText, x0 + (hex.width / 2) - (hex.width/4), y0 + (hex.height - 5));
        }
    };

    //Recusivly step up to the body to calculate canvas offset.
    this.getRelativeCanvasOffset = function() {
        //return {x:hex.canvas.getBoundingClientRect().left, y:hex.canvas.getBoundingClientRect().top};
        var x = 0, y = 0;
        var layoutElement = hex.canvas;
        while (layoutElement.offsetParent) {
            x += layoutElement.offsetLeft;
            y += layoutElement.offsetTop;
            layoutElement = layoutElement.offsetParent;    
        }
        hex.offSetX = x;
        hex.offSetY = y;
        return { x: x, y: y };
        
    }

    //Uses a grid overlay algorithm to determine hexagon location
    //Left edge of grid has a test to acuratly determin correct hex
    this.getSelectedTile = function(mouseX, mouseY) {

        var offSet = hex.getRelativeCanvasOffset();
        console.log("mouse: ", mouseX, mouseY);

        mouseX -= offSet.x;       
        mouseY -= offSet.y;

        mouseX /= hex.scale ;
        mouseY /= hex.scale ;

        mouseX -= hex.tx;
        mouseY -= hex.ty;
        mouseX -= hex.canvasOriginX;
        mouseY -= hex.canvasOriginY;

        var column = Math.floor((mouseX) / hex.side);
        var row = Math.floor(
            column % 2 == 0
                ? Math.floor((mouseY) / hex.height)
                : Math.floor(((mouseY + (hex.height * 0.5)) / hex.height)) - 1);


        //Test if on left side of frame            
        if (mouseX > (column * hex.side) && mouseX < (column * hex.side) + hex.width - hex.side) {


            //Now test which of the two triangles we are in 
            //Top left triangle points
            var p1 = new Object();
            p1.x = column * hex.side;
            p1.y = column % 2 == 0
                ? row * hex.height
                : (row * hex.height) + (hex.height / 2);

            var p2 = new Object();
            p2.x = p1.x;
            p2.y = p1.y + (hex.height / 2);

            var p3 = new Object();
            p3.x = p1.x + hex.width - hex.side;
            p3.y = p1.y;

            var mousePoint = new Object();
            mousePoint.x = mouseX;
            mousePoint.y = mouseY;

            if (hex.isPointInTriangle(mousePoint, p1, p2, p3)) {
                column--;

                if (column % 2 != 0) {
                    row--;
                }
            }

            //Bottom left triangle points
            var p4 = new Object();
            p4 = p2;

            var p5 = new Object();
            p5.x = p4.x;
            p5.y = p4.y + (hex.height / 2);

            var p6 = new Object();
            p6.x = p5.x + (hex.width - hex.side);
            p6.y = p5.y;

            if (hex.isPointInTriangle(mousePoint, p4, p5, p6)) {
                column--;

                if (column % 2 == 0) {
                    row++;
                }
            }
        }

        return  { row: row, column: column };
    };

    this.sign = function(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };

    //TODO: Replace with optimized barycentric coordinate method
    this.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
        var b1, b2, b3;

        b1 = hex.sign(pt, v1, v2) < 0.0;
        b2 = hex.sign(pt, v2, v3) < 0.0;
        b3 = hex.sign(pt, v3, v1) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    };

    this.getIndex = function (x,y) {
        var mouseX = x;
        var mouseY = y;

        var tile = hex.getSelectedTile(mouseX, mouseY);
        //reversed for display reason;
        hex.column = tile.column;
        hex.row = tile.row;
    };
    this.updateUI = function(){
        if (hex.column >= 0 && hex.row >= 0) {
            var drawy = hex.column % 2 == 0 ? (hex.row * hex.height) 
            + hex.canvasOriginY + 6 : (hex.row * hex.height) + hex.canvasOriginY + 6 + (hex.height / 2);
            var drawx = (hex.column * hex.side) + hex.canvasOriginX;
            if(hex.turn === 1)
                hex.drawHex(drawx, drawy - 6, "rgba(255,0,0,0.4)", "");
            else
                hex.drawHex(drawx, drawy - 6, "rgba(255,255,0,0.4)", "");
            
        } 
    };

});


