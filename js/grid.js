function Grid(tilesX, tilesY, previousState){
    this.tilesX = tilesX;
    this.tilesY = tilesY;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
    console.log(this.cells);
}

//create an empty grid
Grid.prototype.empty = function(){
    console.log("Creating empty grid");
    var cells = [];
    for(var x = 0; x <this.tilesX;x++){
        var row = cells[x] = [];
        for(var y =0; y<this.tilesY;y++){
            row.push(null);
        }
    }
    return cells;
}

//return a random tile (for keyboard input when no tile is selected)
Grid.prototype.randomAvailableTile = function(){
    var tiles = this.availableTiles();
    return tiles[Math.floor(Math.random() * tiles.length)]
}

//return a random tile (for keyboard input when no tile is selected)
Grid.prototype.availableTiles = function(){
    var tiles = [];
    this.eachCell(function(x,y,tile){
        if(tile){
            tiles.push({x:y,y:y})
        }
    })
    return tiles
}

//return a random open cell
Grid.prototype.randomAvailableCell = function(){
    var cells = this.availableCells();
    if(cells.length){
        return cells[Math.floor(Math.random() * cells.length)];
    }
}

//return a random cell in the top row

Grid.prototype.randomAvailableCellTop = function(){
    var columns = this.openColumns();
    if(columns.length){
        return columns[Math.floor(Math.random() * columns.length)];
    }
}

//generate all available cells
Grid.prototype.availableCells = function(){
    var cells = [];
    this.eachCell(function(x,y,tile){
        if(!tile){
            cells.push({ x: x, y: y });
        }
    });
    return cells;
}

//return one random position at the top from all columns with an opening at the top
Grid.prototype.randomColumn = function(){
    var columns = this.openColumns();
    if(columns.length){
        return columns[Math.floor(Math.random() * columns.length)];
    } else {
        return null;
    }
}

//find all open columns and return the top position in that column
Grid.prototype.openColumns = function(){
    var columns = [];
    for(var i=0;i<this.tilesX;i++){
        if(!this.cells[i][0]){
            columns.push({ x: i, y: 0 });
        }
    }
    return columns;
}

//perform an action on each cell
Grid.prototype.eachCell = function(callback){
    for(var x = 0; x <this.tilesX;x++){
        for(var y =0; y<this.tilesY;y++){
            callback(x,y,this.cells[x][y]);
        }
    }
}

//check to see if a tile should be falling
Grid.prototype.checkForFalling = function(grid){
    var self = this;
    var falling_cells = [];
    for(var x = 0; x <this.tilesX;x++){
        for(var y =0; y<this.tilesY;y++){
            var tile = this.cells[x][y];
            //only check tiles that exist
            if(tile){
                //check the distance
                var distance = this.checkDistance(tile.x,tile.y,"down");
                //console.log(tile.value);
                //console.log(distance);
                //if there's no tile below, add it to the list of falling tiles
                if(distance || tile.falling){
                    if(!tile.falling){
                       falling_cells.push({ x: x, y: y });
                       tile.startFall(distance);
                       self.moveTileinGrid(tile,{x:x,y:y+distance})
                    } else {
                       falling_cells.push({ x: x, y: y });    
                       tile.keepFalling();
                    }
                } 
            }
        }
    }
    return falling_cells;
}

//checks how many open spaces the tile can proceed in a given direction
Grid.prototype.checkDistance = function(x,y, direction){
    
    switch(direction){
        case "down":
            if(y == this.tilesY-1){
                return 0;
            }
            for(var i = 1; i<(this.tilesY)-y;i++){
                //console.log(this.cells[x][y+i]);
                if((this.cells[x][y+i])){
                    //console.log("tile found");
                    return i-1;
                } 
            }
            //console.log("row empty");
            return (this.tilesY-1)-(y);
            break;
            
        case "up1":
            if(this.cells[x][y-1]){
                return 0
            } else {
                return 1
            }
            break 
            
        case "right1":
            if(x == this.tilesX-1){
                return 0
            }
            if(this.cells[x+1][y]){
                return 0
            } else {
                return 1
            }
            break
            
        case "down1":
            if(this.cells[x][y+1]){
                return 0
            } else {
                return 1
            }
            break 
            
        case "left1":
            if(x == 0){
                return 0
            }
            if(this.cells[x-1][y]){
                return 0
            } else {
                return 1
            }
            break  
            
            default:
             return "error";
            break;
    }
    return 0;
}

Grid.prototype.checkAdjoiningTiles = function(tile1,tile2){
    var xDiff = Math.abs(tile1.x-tile2.x);
    var yDiff = Math.abs(tile1.y-tile2.y);
    if( (xDiff == 1 && yDiff <2) || (yDiff == 1 && xDiff < 2)){
        console.log("adjoining 1!");
        console.log(xDiff);
        console.log(yDiff);
        return true
    }
    if( tile1.x == 0 && tile2.x == this.tilesX-1){
        console.log("adjoining 2!");
        return true
    }
    if( tile2.x == 0 && tile1.x == this.tilesX-1){
        console.log("adjoining 3!");
        return true
    }
    
    return false
}

//moves the tile in the grid to the position it will take after it's fall
Grid.prototype.moveTileinGrid = function(tile, newPos){
    this.cells[tile.x][tile.y] = null;
    this.cells[newPos.x][newPos.y] = tile;
}

//inserts a tile to the grid
Grid.prototype.insertTile = function(tile){
    this.cells[tile.x][tile.y] = tile;
}

//removes a tile to the grid
Grid.prototype.removeTile = function(x,y){
    this.cells[x][y] = null;
}

Grid.prototype.selectionStatus = function(x,y){
    var status = this.cells[x][y].selected;
    return status
}

//process selection of tile
Grid.prototype.selectTile = function(x,y, pos){
    this.cells[x][y].updateSelected(true,pos);
    this.cells[x][y].updateActive(true);
    console.log(this.cells[x][y]);
}

Grid.prototype.activateTile = function(x,y){
    this.cells[x][y].updateActive(true);
    console.log(this.cells[x][y]);
}

Grid.prototype.deselectAll = function(){
    this.eachCell(function(x,y,tile){
        if(tile){
            tile.updateActive(false);
            tile.updateSelected(false, null);
        }
    });
}

//updates code for deselected tile
Grid.prototype.deselectTile = function(x,y){
    this.cells[x][y].updateSelected(false,null);
    this.cells[x][y].updateActive(false);
    console.log(this.cells[x][y]);
}

Grid.prototype.deactivateTile = function(x,y){
    this.cells[x][y].updateActive(false);
}

Grid.prototype.shake = function(){
    var self = this;
    console.log("Shaking!");
    this.eachCell(function(x,y,tile){
        if(tile){
            
            var left_check = self.checkDistance(tile.x,tile.y,"left1");
            var right_check = self.checkDistance(tile.x,tile.y,"right1");
            var up_check = self.checkDistance(tile.x,tile.y,"up1");
            
            if(!up_check){
                    if(left_check && right_check){
                    console.log("both");
                    console.log(x +","+y);
                    console.log(left_check);
                    console.log(right_check);
                    var r = Math.random();
                    if(r<.5){
                        self.cells[x-1][y]= tile;
                        self.cells[x][y]= null;
                        tile.moveLeft(self.tilesX);
                    } else {
                        self.cells[x+1][y]= tile;
                        self.cells[x][y]= null;
                        tile.moveRight(self.tilesX);
                    }
                } else if (left_check) {
                    console.log("left");
                    console.log(x +","+y);
                    console.log(left_check);
                    console.log(this.cells);
                    self.cells[x-1][y]= tile;
                    self.cells[x][y]= null;
                    tile.moveLeft(self.tilesX);
                } else if (right_check){
                    console.log("right");
                    console.log(x +","+y);
                    console.log(right_check);
                    self.cells[x+1][y]= tile;
                    self.cells[x][y]= null;
                    tile.moveRight(self.tilesX);
                }
            }
        }
    });
}

//shift the entire grid left
Grid.prototype.shiftLeft = function(){
    var self = this;
    console.log("Shift left!");
    console.log(this.cells);
    var new_grid = [];
    var column_to_shift = this.cells[0];
    for(var i = 1; i< this.tilesX;i++){
        new_grid.push(this.cells[i])
    }
    new_grid.push(column_to_shift);
    this.cells = new_grid;
    this.eachCell(function(x,y,tile){
        if(tile){
            tile.moveLeft(self.tilesX);
        }
    });
    console.log(new_grid);
}

//shift the entire grid right
Grid.prototype.shiftRight = function(){
    var self = this;
    console.log("Shift right!");
    console.log(this.cells);
    var new_grid = [];
    var column_to_shift = this.cells[this.tilesX-1];
    new_grid.push(column_to_shift);
    for(var i = 0; i< this.tilesX-1;i++){
        new_grid.push(this.cells[i])
    }
    this.cells = new_grid;
    this.eachCell(function(x,y,tile){
        if(tile){
            tile.moveRight(self.tilesX);
        }
    });
    console.log(new_grid);
}

//prints the whole grid in console for testing
Grid.prototype.printGrid = function(){
    console.log(this.cells);
}

//translate tiles loaded from a previous gamestate
Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.tilesX; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.tilesY; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }

  return cells;
};

//represent the grid as an object
Grid.prototype.serialize = function () {
  var cellState = [];

  for (var x = 0; x < this.tilesX; x++) {
    var row = cellState[x] = [];

    for (var y = 0; y < this.tilesY; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }

  return {
    tilesX: this.tilesX,
    tilesY: this.tilesY,
    cells: cellState
  };
};

