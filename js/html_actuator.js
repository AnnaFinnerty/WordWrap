function HTMLActuator(){
    this.events = {};
    this.tile_container = document.querySelector('.tile-container');
    this.word_container = document.querySelector('.word-container');
    this.message_container = document.querySelector('.message-container');
    this.current_level = document.querySelector('.current-level');
    this.level_score = document.querySelector('.level-score');
    this.best_word = document.querySelector('.best-word');
    this.next_level = document.querySelector('.next-level');
    this.total_score = document.querySelector('.total-score');
    this.top_score = document.querySelector('.top-score');
    this.score = 0;
    this.tileSize = window.innerWidth/12;
}

HTMLActuator.prototype.actuate = function(grid,data,tileSize){
    //console.log("Actuating!");
    var self = this;
    
    window.requestAnimationFrame(function(){
        self.clearContainer(self.tile_container);
        if(!data.paused){
            grid.cells.forEach(function(column){
            column.forEach(function(cell){
                if(cell){
                    self.addTile(cell);
                }
            })
          })  
        }
        
        self.word_container.innerHTML = data.selected_word;
        self.message_container.innerHTML = data.message;
        self.current_level.innerHTML = "LEVEL: " + data.level;
        self.level_score.innerHTML = data.level_score;
        self.best_word.innerHTML = data.best_word;
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

HTMLActuator.prototype.addTile = function(tile){
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
    wrapper.style.width = this.tileSize + "px";
    wrapper.style.height = this.tileSize + "px";
    wrapper.style.transform = "translate("+position.x*this.tileSize+"px,"+(position.y-1)*this.tileSize+"px)";
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

HTMLActuator.prototype.getCoordsFromID = function(id){
    var split1 = id.split("tile");
    var split2 = split1[1].split("-");
    var data = {x: parseInt(split2[0],10),y: parseInt(split2[1],10)};
    return data;
}


