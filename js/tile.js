function Tile(position,value,points){
    this.x = position.x;
    this.y = position.y;
    this.currentX = position.x;
    this.currentY = position.y;
    this.goalX = 0;
    this.goalY = 0;
    this.speed = .1;
    this.value = value;
    this.points = points;
    this.selected = false;
    this.selectionPosition = null;
    this.active = false;
    this.highlighted = false;
    this.falling = false;
    
}

Tile.prototype.startFall = function(goalY){
    this.falling = true;
    this.goalY = goalY;
    this.currentY = this.y;
}

Tile.prototype.keepFalling = function(){
    if(this.falling){
        if(this.currentY > this.goalY){
            var newY = this.goalY + this.y;
            this.falling = false;
            this.y = newY;
            this.currentY = newY;
        } else {
            this.currentY = this.currentY+this.speed;
        }
    }
}

Tile.prototype.moveRight = function(tilesX){
    if(this.x == tilesX-1){
        this.x = 0;
        this.currentX = 0;
    } else {
        this.x += 1;
        this.currentX += 1;
    }
}

Tile.prototype.moveLeft = function(tilesX){
    if(this.x == 0){
        this.x = tilesX-1;
        this.currentX = tilesX-1;
    } else {
        this.x -= 1;
        this.currentX -= 1;
    }
}

Tile.prototype.updateSelected = function (selected, position) {
  this.selected = selected;
  this.selectionPosition = position;
};

Tile.prototype.updateActive = function (active) {
  this.active = active;
};

Tile.prototype.updateHighlight = function (highlight) {
  this.highlighted = highlight;
};

Tile.prototype.serialize = function(){
    return{
        position:{
            x: this.x,
            y: this.y,
            currentX: this.currentX,
            currentY: this.currentY,
            goalX: this.goalX,
            goalY: this.goalY,
            speed: this.speed,
            falling: this.falling
        },
        value: this.value,
        points: this.points,
        selected: this.selected,
        selectionPosition: this.selectionPosition,
        active: this.active,
        highlighted: this.highlighted,
    }
}

