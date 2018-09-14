function HTMLActuator(){
    var self = this;
    this.events = {};
    this.tile_container = document.querySelector('.tile-container');
    this.word_container = document.querySelector('.word-container');
    this.message_container = document.querySelector('.message-container');
    this.message_container.addEventListener("click",function(){
        console.log("clicking the fucking message");
        self.click();
    })
    this.current_level = document.querySelector('.current-level');
    this.level_score = document.querySelector('.level-score');
    this.best_word = document.querySelector('.best-word');
    this.best_word_ever = document.querySelector('.best-word-ever');
    this.next_level = document.querySelector('.next-level');
    this.total_score = document.querySelector('.total-score');
    this.top_score = document.querySelector('.top-score');
    this.word_list = document.querySelector('.word-list');
    this.score = 0;
    this.tileSize = window.innerHeight/10;
}

HTMLActuator.prototype.actuate = function(grid,data,tileSize){
    //console.log("Actuating!");
    var self = this;
    
    window.requestAnimationFrame(function(){
        self.clearContainer(self.tile_container);
        if(!data.paused &&!data.levelUp){
            grid.cells.forEach(function(column){
            column.forEach(function(cell){
                if(cell){
                    self.addTile(cell,tileSize);
                }
            })
          })  
        }
        
        self.word_container.innerHTML = data.selected_word;
        self.message_container.innerHTML = data.message;
        //don't display the message if it's empty
        self.message_container.className = data.message == "" ? "message-hidden" : "message-container";
        
        if(data.levelUp){
            var button = document.createElement("button");
            button.innerHTML = "CONTINUE"
        }
        //remove for pics!
        self.current_level.innerHTML = "LEVEL"+data.level;
        self.level_score.innerHTML = data.level_score;
        self.best_word.innerHTML = data.best_word;
        self.best_word_ever = data.best_word_ever;
        self.next_level.innerHTML = data.next_level;
        self.total_score.innerHTML = data.total_score;
        self.top_score.innerHTML = data.top_score;
        self.word_list.innerHTML = data.word_list;
    })
}

HTMLActuator.prototype.clearContainer = function(container){
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
}

HTMLActuator.prototype.addTile = function(tile, tileSize){
    var self = this;
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    var position =  { x: tile.currentX, y: tile.currentY };
    //console.log(position);
    var value = " value"+tile.points;
    var falling = tile.falling ? " falling" : "";
    var selected = tile.selected ? " selected" : "";
    var active = tile.active ? " active" : "";
    wrapper.className = "tile" + value + selected + active + falling;
    wrapper.id = "tile"+tile.x + "-" + tile.y;
    inner.className = "letter";
    inner.innerHTML = tile.value;
    wrapper.style.width = tileSize + "px";
    wrapper.style.height = tileSize + "px";
    wrapper.style.transform = "translate("+position.x*tileSize+"px,"+(position.y-1)*tileSize+"px)";
    wrapper.appendChild(inner);
    this.tile_container.appendChild(wrapper);
    var added_wrapped = document.querySelector("#tile"+tile.x + "-" + tile.y);
    added_wrapped.addEventListener("click",function(){
        event.preventDefault();
        var data = self.getCoordsFromID(this.id);
        self.emit("select", data);
    })
}

HTMLActuator.prototype.styleTile = function(wrapper,tile){
    wrapper.style.transform = "translate("+tile.x*this.tileSize+"px,"+tile.y*this.tileSize+"px)";
}

HTMLActuator.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

HTMLActuator.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

HTMLActuator.prototype.click = function(){
    event.preventDefault();
    this.emit("close_message");
}

HTMLActuator.prototype.continue = function(){
    event.preventDefault();
    this.emit("continue");
}

HTMLActuator.prototype.newPuzzle = function(){
    event.preventDefault();
    this.emit("new_puzzle");
}

HTMLActuator.prototype.newChallenge = function(){
    event.preventDefault();
    this.emit("new_challenge");
}

HTMLActuator.prototype.getCoordsFromID = function(id){
    var split1 = id.split("tile");
    var split2 = split1[1].split("-");
    var data = {x: parseInt(split2[0],10),y: parseInt(split2[1],10)};
    return data;
}



