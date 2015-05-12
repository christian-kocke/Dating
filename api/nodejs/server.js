var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis');
 
server.listen(8888);
io.on('connection', function (socket) {
 
  console.log("new client connected");
  var redisClient = redis.createClient();
  redisClient.subscribe('notifications');
 
  redisClient.on('friend-request', function(channel, message) {
    console.log("mew message in queue "+ message + "channel");
    socket.emit(channel, message);
  });
 
  socket.on('disconnect', function() {
    redisClient.quit();
  });
 
});t