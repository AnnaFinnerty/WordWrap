function Grid(tilesX, tilesY, previousState){
    this.tilesX = tilesX;
    this.tilesY = tilesY;
    this.cells = previousState ? previousState : this.empty();
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

//return a random cell

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

//find all open columns and push the top position of that column
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
                var distance = this.checkDistance(tile,"down");
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
Grid.prototype.checkDistance = function(tile, direction){
    var x = tile.x;
    var y = tile.y;
    
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
            
        case "all":
            break
            
        case "right":
            break
            
        case "left":
            break  
            
            default:
             return 9 - y;
            break;
    }
    return 0;
}

Grid.prototype.checkAdjoiningTiles = function(tile1,tile2){
    var xDiff = Math.abs(tile1.x-tile2.x);
    var yDiff = Math.abs(tile1.y-tile2.y);
    if( xDiff == 1 || yDiff == 1){
        console.log("adjoining!");
        return true
    }
    if( tile1.x == 0 && tile2.x == this.tilesX-1){
        console.log("adjoining!");
        return true
    }
    if( tile2.x == 0 && tile1.x == this.tilesX-1){
        console.log("adjoining!");
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

//prints the whole grid in console for testing
Grid.prototype.printGrid = function(){
    console.log(this.cells);
}

