function GameManager(InputManager, HTMLActuator, LocalStorageManager){
    console.log("Creating Game!");
    
    this.level = 1;
    this.next_level = 50;
    this.level_score = 0;
    this.level_words = [];
    this.best_word_points = 0;
    this.best_word = "";
    this.best_word_level_points = 0;
    this.best_word_level = "";
    this.total_score = 0;
    this.top_score = 0;
    this.puzzleMode = false;
    
    this.message = "";
    this.tips = "Find words to clear letters before the board fills up."
    
    this.floating = false;
    this.float_counter = 300;
    this.can_shake = false;
    this.max_counter = 500;
    this.counter = 0;
    //this.gravityOn = false;
    
    this.tilesAcross = 7;
    this.tilesUp = 9;
    this.inputManager = new InputManager;
    this.htmlActuator = new HTMLActuator;
    this.wordCheck = new WordCheck;
    this.storageManager = new LocalStorageManager;
    
    this.tileSize = (window.innerHeight*.9)/this.tilesUp;
    this.startTiles = 35;
    this.active_tile = null;
    this.selected_tiles = [];
    this.selected_word = "";
    
    this.paused = false;
    this.gameOver = false;
    this.levelUp = false;
    this.autoWordCheck = false;
    
    //send identifiers and callback functions to the input manager
    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("pause", this.pauseToggle.bind(this));
    this.inputManager.on("submit", this.manualSubmitHelper.bind(this));
    this.inputManager.on("shake", this.shake.bind(this));
    this.inputManager.on("shiftLeft", this.shiftGridLeft.bind(this));
    this.inputManager.on("shiftRight", this.shiftGridRight.bind(this));
    this.inputManager.on("newChallenge", this.newChallenge.bind(this));
    this.inputManager.on("newPuzzle", this.newPuzzle.bind(this));
    this.htmlActuator.on("select", this.select.bind(this));
    this.htmlActuator.on("start", this.start.bind(this));
    this.htmlActuator.on("submit", this.manualSubmitHelper.bind(this));
    this.htmlActuator.on("close_message", this.resetMessage.bind(this));
    
    this.float_word = document.querySelector("float-word");
    
    this.screenSetUp();
    var start_message = "Click adjoining tiles to make words.<br> Hurry before the screen fills up!";
    this.gameSetUp(start_message,false);
}

//set up the game
GameManager.prototype.gameSetUp = function(message,puzzlemode){
    console.log("Setting up game!");
    var previousState = this.storageManager.getGameState();
    console.log(previousState);
    
    //loading from previous state is turned off
    if(false){
        this.message = "";
        this.levelUp = false;
        this.grid = new Grid(this.tilesAcross,this.tilesUp,previousState.grid.cells);
        this.level_score = previousState.level_score;
        this.total_score = previousState.total_score;
        this.top_score = previousState.top_score;
        this.best_word = previousState.best_word;
        this.best_word_points = previousState.best_word_points;
        this.active_tile = previousState.active_tile;
        this.selected_tiles = previousState.selected_tiles;
        this.selected_word = previousState.selected_word;
        this.puzzleMode = previousState.puzzleMode;
    } else {
        this.message = this.intructions();
        //add alternative route if there is previous game storage here
        this.grid = new Grid(this.tilesAcross, this.tilesUp);
        this.level_score = 0;
        this.active_tile = null;
        this.selected_tiles = [];
        this.selected_word = ""; 
        this.levelUp = true;   
    }
    
    this.counter = 0;
    this.gameOver = false;
    this.paused = false;
    
    this.addStartTiles();
    
    //common point to both paths starts here
    this.actuate(); 
}

//turns on the levelUp state when advancing levels
GameManager.prototype.advanceLevel = function(){
    console.log("Advancing Level!");
    this.levelUp = true;
    this.pauseToggle();
    this.message = this.levelUpText();
    this.newLevel();
    this.actuate();
}

//starts level (on click/key input)
GameManager.prototype.start = function(){
    console.log("Starting!");
    this.levelUp = false;
    this.paused = false;
    this.message = "LEVEL " + this.level;
    this.update();
    if(!this.puzzleMode){
        this.timer();
    }
    this.actuate();
}

//builds settings for the new level
GameManager.prototype.newLevel = function(){
    console.log("new level!");
    this.level += 1;
    this.next_level = 50 * this.level;
    this.level_words = [];
    if(this.startTiles < (this.tilesAcross * this.tilesUp)*.9){
        this.startTiles = this.startTiles + 5;
    }
    if(this.max_counter > 100){
        this.max_counter = this.max_counter*.99;
    }else{
        this.max_counter = 100;
    }
    
        
        this.grid = new Grid(this.tilesAcross, this.tilesUp);
        this.level_score = 0;
        this.active_tile = null;
        this.selected_tiles = [];
        this.selected_word = "";
        this.counter = 0;
        this.gameOver = false;
        this.paused = false;
    
        this.addStartTiles();
    
        //this.actuate();
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
}

//fill the whole grid (for puzzle mode)
GameManager.prototype.fillGrid = function(){
    for(var x=0;x<this.tilesAcross;x++){
       for(var y=0;y<this.tilesUp;y++){
            var letter = this.randomLetter();
            var tile = new Tile({ x: x, y: y },letter,this.pointValueMap(letter));
            this.grid.insertTile(tile);
       }   
    }
}

//generate a random tile anywhere on the board
GameManager.prototype.addRandomTile = function(){
    //add a check if tiles are available in grid
    var letter = this.randomStartLetter();
    var tile = new Tile(this.grid.randomAvailableCell(),letter,this.pointValueMap(letter));
    this.grid.insertTile(tile);
}

//generate a random tile in the top row
//! this is also where the message gets turned off in normal play
//! this is also what determines the end of the game in challenge mode
GameManager.prototype.addRandomTileTop = function(){
    
    //check if a new tile can be added; if not, end the game
    var openPos = this.grid.randomAvailableCellTop();
    if(openPos){
        var letter = this.randomLetter();
        var tile = new Tile(openPos,letter,this.pointValueMap(letter));
        this.grid.insertTile(tile);
        if(!this.levelUp){
            this.message = "";
        }
    } else {
        if(!this.puzzleMode){
            this.message = "GAME OVER";
            this.endGame();
        }
    }
    //this.grid.printGrid();
}

//sends data to and starts HTMLActuator
GameManager.prototype.actuate = function(){
    
    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
        this.storageManager.clearGameState();
      } else {
        this.storageManager.setGameState(this.serialize());
      }
    
    var data = {
        paused: this.paused,
        levelUp: this.levelUp,
        selected_word: this.selected_word,
        message: this.message,
        level: this.level,
        next_level: this.next_level,
        level_score: this.level_score,
        best_word: this.best_word_level,
        best_word_ever: this.best_word,
        total_score: this.total_score,
        top_score: this.top_score,
        word_list: this.level_words,
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

//<-- not working yet. No arrow functions.
//selected or highlight a new tile (with arrow keys);
GameManager.prototype.move = function(direction){
    console.log("arrow moving!");
    console.log(direction);
    
    // <-- it would be better to chose a tile from a consistent location
    //if no tile is active, choose a random one to start on
    if(!this.active_tile){
        this.active_tile = this.grid.randomAvailableTile();
        this.grid.activateTile(this.active_tile.x, this.active_tile.y);
    } else {
        var check;
        var new_tile = null;
        switch(direction){
            case 0:
                check = this.grid.checkDistance(this.active_tile.x, this.active_tile.y, "up1");
                console.log("check0:  " + check);
                //<-- this is confusing and should be changed
                //checkDistance checks if a tile is empty, so to find a tile it should return false
                if(!check){
                    new_tile = {x:this.active_tile.x, y:this.active_tile.y-1}
                }
                break
            case 1:
                check = this.grid.checkDistance(this.active_tile.x, this.active_tile.y, "right1");
                console.log("check1:  " + check);
                if(!check){
                    new_tile = {x:this.active_tile.x+1, y:this.active_tile.y}
                }
                break
            case 2:
                check = this.grid.checkDistance(this.active_tile.x, this.active_tile.y, "down1");
                console.log("check2:  " + check);
                if(!check){
                    new_tile = {x:this.active_tile.x, y:this.active_tile.y+1}
                }
                break
            case 3:
                check = this.grid.checkDistance(this.active_tile.x, this.active_tile.y, "left1");
                console.log("check3:  " + check);
                if(!check){
                    new_tile = {x:this.active_tile.x-1, y:this.active_tile.y}
                }
                break
        }
        if(new_tile){
            this.active_tile = new_tile;
            this.grid.activateTile(new_tile.x, new_tile.y);
        }
    }
    this.actuate();
}

//<-- function should be broadened, with the help of a click helper function, so it can take input from keystrokes too
//select or highlight a new tile (with mouse click);
GameManager.prototype.select = function(data){
    console.log("tile selected: "+data.x+", "+data.y);
    
    if(!this.gameOver){
        
        //check if the tile is already selected
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
            } else {

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
    }
    //this.grid.printGrid();
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

//remove the (de)selected tile (and any tiles added after it was)
GameManager.prototype.tileDeselect = function(data){
    console.log("deselect");
    var pos = this.grid.cells[data.x][data.y].selectionPosition;
    if(pos == 0){
        this.resetSelection();
        this.grid.deselectAll();
    } else {
        this.active_tile = this.selected_tiles[pos-1];
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
    
}

//empty out all the containers for selected letters
GameManager.prototype.resetSelection = function(){
    this.selected_word = "";
    this.active_tile = null;
    this.selected_tiles = [];
}

// a helper for manually entering words when AutoCheck is off. 
// ???can't figure out how to bind checkWord directly to emit path (and pass in word too)
GameManager.prototype.manualSubmitHelper = function(){
    var word = this.selected_word;
    //if there's a selection, test it. If not, call a new tile.
    if(this.selected_tiles.length > 0){
        this.checkWord(word);
    } else {
        this.addRandomTileTop();
        this.actuate();
    }
}

//a promise to return the value generated by wordCheck functions
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
        function(result){self.addToScore(result)},
        function(error){console.log(error)}
    );
}

//a word has been successfully found, so update the score and other data
GameManager.prototype.addToScore = function(result){
    if(result == 1){
        var word = this.selected_word;
        this.level_words.push(word);
        var word_points = this.sumPoints(word);
        if(word_points > this.best_word_level_points){
            this.best_word_level_points = word_points;
            this.best_word_level = word;
            if(word_points > this.best_word_points){
                this.best_word_points = word_points;
                this.best_word = word;
            }
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
            this.advanceLevel();
        }
    } else {
        this.message = "hey, that's not a word!";
        this.resetSelection();
        this.grid.deselectAll();
    }
    this.actuate();
}

GameManager.prototype.shake = function(){
    if(!this.paused){
        this.grid.shake();
        this.actuate();
    }    
}

GameManager.prototype.shiftGridLeft = function(){
    if(!this.paused){
       console.log("shifting left");
       this.grid.shiftLeft();
       this.actuate(); 
    }
}

GameManager.prototype.shiftGridRight = function(){
    if(!this.paused){
        console.log("shifting right");
        this.grid.shiftRight();
        this.actuate();
    }
}

GameManager.prototype.resetMessage = function(){
    this.message = "";
    if(this.paused){
        this.pauseToggle();
    }
    if(this.gameOver){
        if(this.puzzleMode){
            this.newPuzzle();
        } else {
            this.newChallenge();
        }
    }
    this.actuate();
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
        this.level_score = 0;
        this.total_score = 0;
        this.resetSelection();
        this.actuate();
        this.storageManager.clearGameState();
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
    if(!this.paused && !this.puzzleMode && !this.levelUp){
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

//generate a random letter for a starting tile
GameManager.prototype.randomStartLetter = function(){
    var temp_letters = ['A','B','D','E','H','N','U','T'];
    var letters = ['A','A','A','B','B','C','D','D','E','E','E','E','F','G','H','I','I','I','I','J','K','L','L','M','M','N','N','O','O','O','O','P','R','R','S','S','T','T','U','U','U','V','W','Y','Z'];
    var r = Math.floor(Math.random()*letters.length);
    var newLetter = letters[r];
    return newLetter;
}

//generate a random letter for an in-game tile
GameManager.prototype.randomLetter = function(){
    var temp_letters = ['A','B','D','E','H','N','U','T'];
    var letters = ['A','A','A','A','B','B','C','C','D','D','E','E','E','E','E','F','F','G','G','H','H','I','I','I','I','J','K','L','L','M','M','N','N','O','O','O','O','P','P','Q','R','R','S','S','S','T','T','T','U','U','U','U','V','W','X','Y','Y','Y','Z'];
    var r = Math.floor(Math.random()*letters.length);
    var newLetter = letters[r];
    return newLetter;
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

//sum points
GameManager.prototype.sumPoints = function(word){
    var sum = 0;
    for(var i = 0; i<word.length;i++){
        var points = this.pointValueMap(word.charAt(i));
        sum += points;
    }
    return sum;
}

//the instruction text
GameManager.prototype.intructions = function(){
    var instruction_text = "<span class='glyphicons glyphicons-arrow-right'></span>Select adjoining tiles using arrows keys or mouse. <br><span class='glyphicons glyphicons-arrow-right'></span> Letters can be connected in any direction, or on the diagonal. <br><span class='glyphicons glyphicons-arrow-right'></span> Submit words with spacebar to earn points and clear the screen. <br><span class='glyphicons glyphicons-arrow-right'></span> If the board completely fills, the game is over. <br><span class='glyphicons glyphicons-arrow-right'></span> Alt keys shift the grid. <br><span class='glyphicons glyphicons-arrow-right'></span> Shift key shakes loose letters.";
    return instruction_text
}

//the instruction text
GameManager.prototype.levelUpText = function(){
    var longest_word = "a";
    var shortest_word = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    for(var i = 0; i< this.level_words.length;i++){
        var word = this.level_words[i];
        
        if(word.length > longest_word.length){
            longest_word = word;
        }
        if(word.length < shortest_word.length){
            shortest_word = word;
        }
    }
    var levelUpText = "Level "+ this.level + " Complete! <br> Total points: " + this.level_score + "<br>Words found: "+ this.level_words.length+"<br>Best Word: " + this.best_word +"<br> Longest Word: " + longest_word + "<br> Shortest Word: " + shortest_word;
    return levelUpText
}

// set up screen and sizes on intial load and resize
GameManager.prototype.screenSetUp = function(){
    var sidebar = document.querySelector(".sidebar-container");
    var board = document.querySelector(".board-container");
    var tile_container = document.querySelector(".tile-container");
    var message_container = document.querySelector(".message-container");
    
    console.log(typeof(window.innerWidth));
    
    if(window.innerWidth < 700){
        console.log("mobile mode");
        this.tileSize = (window.innerWidth*.9)/this.tilesAcross;
        
        sidebar.className = "hidden";
        sidebar.style.width = window.innerWidth + "px";
        sidebar.style.height = window.innerHeight*.1 + "px";
        
        board.style.width = window.innerWidth+ "px";
        board.style.height = window.innerHeight*.8 + "px";
        
        tile_container.style.width = this.tileSize*this.tilesAcross+ "px";
        //var tile_container_translate = ((window.innerWidth*.8) - (this.tileSize*this.tilesAcross))*.25;
        tile_container.style.height = window.innerHeight*.8 + "px";
        message_container.style.transform = "translate(30vw,-100vh)";
        //tile_container.style.transform = "translate("+tile_container_translate+"px,0)";
    } else {
        sidebar.className = "sidebar";
        sidebar.style.width = window.innerWidth*.3 + "px";
        sidebar.style.height = window.innerHeight + "px";
        
        board.style.width = window.innerWidth*.7+ "px";
        board.style.height = window.innerHeight*.8 + "px";
        
        tile_container.style.width = this.tileSize*this.tilesAcross+ "px";
        var tile_container_translate = ((window.innerWidth*.8) - (this.tileSize*this.tilesAcross))*.25;
        tile_container.style.height = window.innerHeight*.8 + "px";
        message_container.style.transform = "translate(30vw,-100vh)";
        //tile_container.style.transform = "translate("+tile_container_translate+"px,0)";
    }
    
}

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:  this.grid.serialize(),
    selected_tiles: this.selected_tiles,
    active_tile: this.active_tile,
    level: this.level,
    level_score: this.level_score,
    level_words: this.level_words,
    best_word_points: this.best_word_points,
    best_word: this.best_word,
    best_word_level_points: this.best_word_level_points,
    best_word_level: this.best_word_level,
    total_score: this.total_score,
    top_score: this.top_score,
    puzzle_mode: this.puzzleMode
  };
};