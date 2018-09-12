function GameManager(InputManager, HTMLActuator, LocalStorageManager){
    console.log("Creating Game!");
    
    this.level = 1;
    this.next_level = 50;
    this.level_score = 0;
    this.best_word_points = 0;
    this.best_word = "";
    this.total_score = 0;
    this.top_score = 0;
    this.puzzleMode = false;
    
    this.message = "";
    
    this.max_counter = 500;
    this.counter = 0;
    //this.gravityOn = false;
    
    this.tilesAcross = 7;
    this.tilesUp = 10;
    this.inputManager = new InputManager;
    this.htmlActuator = new HTMLActuator;
    this.wordCheck = new WordCheck;
    
    this.tileSize = window.innerHeight/this.tilesUp;
    this.startTiles = 35;
    this.active_tile = null;
    this.selected_tiles = [];
    this.selected_word = "";
    
    this.paused = false;
    this.gameOver = false;
    this.levelUp = false;
    this.autoWordCheck = false;
    
    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("pause", this.pauseToggle.bind(this));
    this.inputManager.on("submit", this.manualSelectHelper.bind(this));
    this.inputManager.on("newChallenge", this.newChallenge.bind(this));
    this.inputManager.on("newPuzzle", this.newPuzzle.bind(this));
    this.htmlActuator.on("select", this.select.bind(this));
    
    this.screenSetUp();
    var start_message = "Click adjoining tiles to make words.<br> Hurry before the screen fills up!";
    this.gameSetUp(start_message,false);
}

//set up the game
GameManager.prototype.gameSetUp = function(message,puzzlemode){
    console.log("Setting up game!");
    
    this.message = message;
    //add alternative route if there is previous game storage here
    this.grid = new Grid(this.tilesAcross, this.tilesUp);
    this.level_score = 0;
    this.gameOver = false;
    this.paused = false;
    
    this.counter = 0;
    this.active_tile = null;
    this.selected_tiles = [];
    this.selected_word = "";
    
    this.addStartTiles();
    
    //common point to both paths starts here
    this.actuate();
    if(!puzzlemode){
        this.timer();
    }
    
}

//new challenge game
GameManager.prototype.newLevel = function(){
    console.log("new level!");
    this.level += 1;
    this.next_level = this.next_level * 2;
    if(this.startTiles < (this.tilesAcross * this.tilesUp)*.9){
        this.startTiles = this.startTiles + 5;
    }
    if(this.max_counter > 100){
        this.max_counter = this.max_counter*.9;
    }else{
        this.max_counter = 100;
    }
    
    this.gameSetUp("NEXT LEVEL",false);
}

//add starting tiles
GameManager.prototype.addStartTiles = function(){
    console.log("Adding Start Tiles");
    if(this.puzzleMode){
        this.fillGrid();
    } else {
        for(var i=0;i<this.startTiles;i++){
            this.addRandomTile();
        }
    }
    //this.testTiles();
}

//add tiles for testing scenarios
GameManager.prototype.testTiles = function(){
    //used for testings tiles. otherwise addRandomTiles should be used to start
    var tile1 = new Tile({x:0,y:9},"A",2);
    this.grid.insertTile(tile1);
    var tile2 = new Tile({x:0,y:0},"B",2);
    this.grid.insertTile(tile2);
    var tile3 = new Tile({x:1,y:0},"C",2);
    this.grid.insertTile(tile3);
}

GameManager.prototype.fillGrid = function(){
    for(var x=0;x<this.tilesAcross;x++){
       for(var y=0;y<this.tilesUp;y++){
            var letter = this.randomLetter();
            var tile = new Tile({ x: x, y: y },letter,this.pointValueMap(letter));
            this.grid.insertTile(tile);
       }   
    }
}

//generate a random tile
GameManager.prototype.addRandomTile = function(){
    //add a check if tiles are available in grid
    var letter = this.randomLetter();
    var tile = new Tile(this.grid.randomAvailableCell(),letter,this.pointValueMap(letter));
    this.grid.insertTile(tile);
}

//generate a random tile in the top row
GameManager.prototype.addRandomTileTop = function(){
    
    //check if a new tile can be added; if not, end the game
    var openPos = this.grid.randomAvailableCellTop();
    if(openPos){
        var letter = this.randomLetter();
        var tile = new Tile(openPos,letter,this.pointValueMap(letter));
        this.grid.insertTile(tile);
        this.message = "";
    } else {
        if(!this.puzzleMode){
            this.message = "GAME OVER";
            this.endGame();
        }
    }
    //this.grid.printGrid();
}

//generate a random letter for a tile
GameManager.prototype.randomLetter = function(){
    var temp_letters = ['A','B','D','E','H','N','U','T'];
    var letters = ['A','A','A','B','B','C','C','D','D','E','E','E','E','F','F','G','G','H','H','I','I','I','I','J','K','L','L','M','M','N','N','O','O','O','O','P','P','Q','R','R','S','S','S','T','T','T','U','U','U','V','W','X','Y','Y','Y','Z'];
    var r = Math.floor(Math.random()*letters.length);
    var newLetter = letters[r];
    return newLetter;
}

//build html
GameManager.prototype.actuate = function(){
    var data = {
        paused: this.paused,
        selected_word: this.selected_word,
        message: this.message,
        level: this.level,
        next_level: this.next_level,
        level_score: this.level_score,
        best_word: this.best_word,
        total_score: this.total_score,
        top_score: this.top_score
    };
    this.htmlActuator.actuate(this.grid,data,this.tileSize);
    this.update();
}

//checks all tiles for updates when the board has change
GameManager.prototype.update = function(){
    var self = this;
    //console.log("updating tiles!");
    var falling_tiles = this.grid.checkForFalling(this.grid);
    //if there are falling tiles, continue to animate the acuator
    if(!this.paused && falling_tiles.length > 0){
        window.requestAnimationFrame(function(){
                self.actuate();
            })
    }
}

//timer helper
GameManager.prototype.moveTimer = function(){
    this.timer();
}

//timer for dropping new tiles
GameManager.prototype.timer = function(){
    //console.log("timer");
    var self = this;
    if(!this.paused && !this.puzzleMode){
        if(this.counter <this.max_counter){
        this.counter = this.counter + 1;
        } else {
            this.counter = 0;
            
            // add a random tile when the counter reaches it's goal, reset the counter and set new max
            this.addRandomTileTop();
            this.actuate();
            //console.log("new tile not being added!");
        }
        //console.log(this.counter);
       window.requestAnimationFrame(function(){
            self.moveTimer();
        });
    }
}

//<-- pause isn't working great
//toggle between the one and off state
GameManager.prototype.pauseToggle = function(){
    console.log("Toggling pause!");
    this.paused = !this.paused;
    if(!this.paused){
        this.message = "";
        this.actuate();
        if(!this.puzzleMode){
            this.timer();
        }
    } else {
        this.message = "PAUSED";
        this.actuate();
    }
}

//selected or highlight a new tile (with arrow keys);
GameManager.prototype.move = function(direction){
    console.log("arrow moving!");
    console.log(direction);
}

//select or highlight a new tile (with mouse click);
GameManager.prototype.select = function(data){
    console.log("tile selected: "+data.x+", "+data.y);
    
    var selected_status = this.grid.selectionStatus(data.x,data.y);
    
    if(!selected_status){
        
        var pos = this.selected_tiles.length ? this.selected_tiles.length : 0;
        
        //if the tile is selected, determine if there is already an active tile
        if(this.active_tile){
            
            //check both the currently active tile and the first select tile to see if the new tile connects
            var check1 = this.grid.checkAdjoiningTiles(this.active_tile,data);
            console.log("check1:  " + check1);
            var check2 = this.grid.checkAdjoiningTiles(this.selected_tiles[0],data);
            console.log("check2:  " + check2);
            if(check1 || check2){
                this.tileSelect(data,pos);
            }
        }else{
            
            //if there's no active tile, this is now the active tile
            this.tileSelect(data,pos);
        }
    } else {
        this.tileDeselect(data);
    }
    if(this.selected_tiles.length>2 && this.autoWordCheck){
        this.checkWord(this.selected_word);
    }
    this.actuate();
    //this.grid.printGrid();
}

GameManager.prototype.manualSelectHelper = function(){
    var word = this.selected_word;
    this.checkWord(word);
}

GameManager.prototype.checkWord = function(word){
    console.log("checking:  " + word);
    var self = this;
    var word_test = this.wordCheck.checkWord(word);
    var promise = new Promise(function(resolve,reject){
        var test = self.wordCheck.APIcheck(word);
        if(test){
            resolve(test);
        } else {
            reject(test)
        }
    })
    
    promise.then(
        function(result){return self.addToScore(result)},
        function(error){console.log(error)}
    );
}

GameManager.prototype.addToScore = function(result){
    if(result == 1){
        var word = this.selected_word;
        var word_points = this.sumPoints(word);
        if(word_points > this.best_word_points){
            this.best_word_points = word_points;
            this.best_word = word;
        }
        this.level_score += word_points;
        this.total_score += word_points;
        for(var i=0;i<this.selected_tiles.length;i++){
            var data = this.selected_tiles[i];
            this.grid.removeTile(data.x,data.y);
        }
        this.resetSelection();
        
        //if the level score is above next level, move to the next level
        if(this.level_score > this.next_level && !this.puzzleMode){
            this.newLevel();
        }
    } else {
        this.message = "hey, that's not a word!";
        this.resetSelection();
    }
    this.actuate();
}

//process a selected tile
GameManager.prototype.tileSelect = function(data,pos){
    this.grid.selectTile(data.x,data.y,pos);
    this.selected_tiles.push(data);
    this.active_tile = data;
    var new_letter = this.grid.cells[data.x][data.y].value;
    this.selected_word = this.selected_word + new_letter;
    console.log(this.selected_tiles);
}

GameManager.prototype.tileDeselect = function(data){
    console.log("deselect");
    var pos = this.grid.cells[data.x][data.y].selectionPosition;
    if(pos == 0){
        this.resetSelection();
    }
    this.active_tile = null;
    this.grid.deactivateTile(data.x,data.y);
    this.grid.deselectTile(data.x,data.y);
    
    this.selected_word = this.selected_word.substr(0,pos);
    
    for(var x = pos; x<this.selected_tiles.length;x++){
        var tile = this.selected_tiles[x];
        console.log("deselect" + tile);
        this.grid.deselectTile(tile.x,tile.y);
        this.grid.deactivateTile(tile.x,tile.y);
    }
    this.selected_tiles.splice(pos,this.selected_tiles.length-1);
    console.log(this.selected_tiles);
}

GameManager.prototype.resetSelection = function(){
    this.selected_tiles = [];
    this.selected_word = "";
    this.active_tile = null;
}

//new challenge game
GameManager.prototype.newChallenge = function(){
    console.log("starting new challenge game!");
    this.puzzleMode = false;
    this.gameSetUp("NEW GAME",false);
}

//new puzzle game
GameManager.prototype.newPuzzle = function(){
    console.log("starting new puzzle game!");
    this.puzzleMode = true;
    this.gameSetUp("NEW GAME",true);
}

//ends the game
GameManager.prototype.endGame = function(){
    if(!this.gameOver){
       console.log("game over, man");
        this.gameOver = true;
        this.actuate(); 
    }
}

//map of tile values
GameManager.prototype.pointValueMap = function(letter){
    var map = {
        A: 1,
        B: 2,
        C: 2,
        D: 2,
        E: 1,
        F: 2,
        G: 2,
        H: 2,
        I: 1,
        J: 4,
        K: 3,
        L: 2,
        M: 2,
        N: 2,
        O: 1,
        P: 2,
        Q: 4,
        R: 2,
        S: 2,
        T: 2,
        U: 1,
        V: 4,
        W: 3,
        X: 4,
        Y: 3,
        Z: 4, 
    }
    return map[letter];
}


GameManager.prototype.sumPoints = function(word){
    var sum = 0;
    for(var i = 0; i<word.length;i++){
        var points = this.pointValueMap(word.charAt(i));
        sum += points;
    }
    return sum;
}



// set up screen and sizes on intial load and resize
GameManager.prototype.screenSetUp = function(){
    var sidebar = document.querySelector(".sidebar-container");
    sidebar.style.width = window.innerWidth*.3 + "px";
    sidebar.style.height = window.innerHeight + "px";
    var board = document.querySelector(".board-container");
    board.style.width = window.innerWidth*.7+ "px";
    board.style.height = window.innerHeight + "px";
    var tile_container = document.querySelector(".tile-container");
    tile_container.style.width = window.innerWidth*.7+ "px";
    tile_container.style.height = window.innerHeight + "px";
}