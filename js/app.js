
window.requestAnimationFrame(function () {
  console.log("App running");
  new GameManager(InputManager, HTMLActuator, LocalStorageManager); 
});
