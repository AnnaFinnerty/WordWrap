function HTMLActuator(){
    this.levelUp = false;
    var self = this;
    this.events = {};
    this.tile_container = document.querySelector('.tile-container');
    this.word_container = document.querySelector('.word-container');
    this.word_container.addEventListener("click",function(){
        self.submit();
    })
    this.message_container = document.querySelector('.message-container');
    this.message_container.addEventListener("click",function(){
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
    this.shake_bar = document.querySelector('.shake-bar');
    this.score = 0;
    this.tileSize = window.innerHeight/10;
}

HTMLActuator.prototype.actuate = function(grid,data,tileSize){
    //console.log("Actuating!");
    var self = this;
    this.levelUp = data.levelUp;
    window.requestAnimationFrame(function(){
        self.clearContainer(self.tile_container);
        if(!data.paused){
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
        var message_container_showing = data.message == "" ? "message-container hidden" : "message-container";
        var message_container_length = data.levelUp ? " long" : " short";
        if(data.levelUp){
            var text;
            if(data.level == 1){
                text = "START";
            } else {
                text = "NEXT LEVEL"
            }
            self.addButton(self.message_container,text,"start");
        }
        self.message_container.className = message_container_showing + message_container_length;
        //remove for pics!
        self.current_level.innerHTML = "LEVEL"+data.level;
        self.level_score.innerHTML = data.level_score;
        self.best_word.innerHTML = data.best_word;
        self.best_word_ever = data.best_word_ever;
        self.next_level.innerHTML = data.next_level;
        self.total_score.innerHTML = data.total_score;
        self.top_score.innerHTML = data.top_score;
    })
}

HTMLActuator.prototype.clearContainer = function(container){
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
}

HTMLActuator.prototype.addButton = function(container, text, emit){
    var button = document.createElement("button");
        button.innerHTML = text;
        button.className = "message-button";
        button.id = "message_button_"+emit;
    container.appendChild(button);
    var self = this;
    var added_button = document.querySelector("#message_button_"+emit);
        added_button.addEventListener("click",function(){
            self.emit(emit);
        })
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
    if(this.levelUp){
        this.start();
    } else {
        this.emit("close_message");
    }
}

HTMLActuator.prototype.start = function(){
    event.preventDefault();
    console.log("Clicking start!");
    this.emit("start");
}

HTMLActuator.prototype.submit = function(){
    event.preventDefault();
    console.log("submitting!");
    this.emit("submit");
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



