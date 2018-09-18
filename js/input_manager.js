function InputManager(){
    this.events = {};
    
    if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }
    
    this.listen();
}

InputManager.prototype.listen = function(){
    
    var self = this; 
    
    console.log("Listening");
    var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3, // A
    80: 4, //P -- paused 
    32: 5, //space -- submit/hold  
    16: 6, // shift -- shake
    18: 7 // alt -- shift left/right
  };
    
    //respond to button presses
    this.bindButtonPress(".pause-button",this.pause);
    this.bindButtonPress(".submit-button",this.submit);
    this.bindButtonPress(".shake-button",this.shake);
    this.bindButtonPress(".new-challenge-button",this.newChallenge);
    this.bindButtonPress(".new-puzzle-button",this.newPuzzle);
    this.bindButtonPress(".arrow-right",this.shiftRight);
    this.bindButtonPress(".arrow-left",this.shiftLeft);
    
    // Respond to direction keys
    document.addEventListener("keydown", function (event) {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                        event.shiftKey;
        var mapped    = map[event.which];

          if (mapped !== undefined) {
              event.preventDefault();
              switch(mapped){
                  case 4:
                      self.pause();
                      break
                  case 5:
                      self.submit();
                      break
                  case 6:
                      self.shake();
                      break  
                  case 7:
                      if(event.location == 0){
                          self.shiftLeft();
                      } else {
                          self.shiftRight();
                      }
                      break 
                  default:
                     self.emit("move", mapped); 
                      break
              }
          }
        
    });
}

InputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

InputManager.prototype.emit = function (event, data) {
  console.log("action logged:  " + event + ", " + data);
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

InputManager.prototype.pause = function(){
    event.preventDefault();
   this.emit("pause");
}

InputManager.prototype.submit = function(){
    event.preventDefault();
   this.emit("submit");
}

InputManager.prototype.shake = function(){
    event.preventDefault();
    this.emit("shake");
}

InputManager.prototype.shiftRight = function(){
   event.preventDefault();
   this.emit("shiftRight");
}

InputManager.prototype.shiftLeft = function(){
   event.preventDefault();
   this.emit("shiftLeft");
}

InputManager.prototype.newChallenge = function(){
    event.preventDefault();
   this.emit("newChallenge");
}

InputManager.prototype.newPuzzle = function(){
    event.preventDefault();
   this.emit("newPuzzle");
}

InputManager.prototype.bindButtonPress = function(selector,fn){
    var button = document.querySelector(selector);
    button.addEventListener("click",fn.bind(this));
}