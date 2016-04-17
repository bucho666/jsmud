/* global require, process */
require('./extend');

var Room = function() {
  this._avatars = [];
  this._description = 'あなたはダンジョンの入り口に立っている。';
};

Room.prototype.description = function() {
  return this._description;
};

Room.prototype.addAvatar = function(avatar) {
  this._avatars.push(avatar);
  avatar.send(this._description);
};

Room.prototype.removeAvatar = function(avatar) {
  for (var i = 0; i < this._avatars.length; i++) {
    if (avatar === this._avatars[i]) {
      this._avatars.splice(i, 1);
      break;
    }
  }
};

Room.prototype.sendAll = function(message) {
  for (var i = 0; i < this._avatars.length; i++) {
      this._avatars[i].send(message);
  }
};

var MessageHandler = function() {
  this._handle = {};
};

MessageHandler.prototype.handle = function(avatar, message) {
  if (message in this._handle) {
    this._handle[message](avatar, message);
  } else {
    this.defaultHandle(avatar, message);
  }
};

MessageHandler.prototype.defaultHandle = function() {};
MessageHandler.prototype.initialize = function() {};

var NameInputHandler = function() {
  MessageHandler.call(this);
  this._handle = {
      yes: this.yes.bind(this),
      no: this.no.bind(this)
  };
};
NameInputHandler.inherit(MessageHandler);

NameInputHandler.prototype.initialize = function(avatar) {
  avatar.send('Who are you?: ');
};

NameInputHandler.prototype.yes = function(avatar) {
  if (avatar.isNoName()) {
    avatar.send('you can\'t specifid name yes.');
    return;
  }
  avatar.setHandler(new MainHandler());
};

NameInputHandler.prototype.no = function(avatar) {
  avatar.clearName();
  this.initialize(avatar);
};

NameInputHandler.prototype.defaultHandle = function(avatar, message) {
  if (avatar.isNoName()) {
    avatar.setName(message);
  }
  avatar.send('you name is ' + avatar.name() + ' OK? (yes or no)');
};

var MainHandler = function() {
  MessageHandler.call(this);
  this._handle = {
    quit: this.quit,
    logout: this.logout,
    look: this.look
  };
};
MainHandler.inherit(MessageHandler);

MainHandler.prototype.quit = function() {
  process.exit();
};

MainHandler.prototype.logout = function(avatar) {
  room.removeAvatar(avatar);
  room.sendAll(avatar.name() + ' leave.');
  avatar.close();
};

MainHandler.prototype.look= function(avatar) {
  avatar.send(room.description());
};

MainHandler.prototype.defaultHandle = function(avatar, message) {
  room.sendAll(avatar.name() + ' say "' + message + '"');
};

MainHandler.prototype.initialize = function(avatar) {
  avatar.send('Welcome ' + avatar.name() + '!');
  room.addAvatar(avatar);
};

var Avatar = function(socket, handler) {
  this._socket = socket;
  this._handler = handler;
  this._name = null;
};

Avatar.prototype.name = function() {
  return this._name;
};

Avatar.prototype.setName = function(newName) {
  this._name = newName;
};

Avatar.prototype.isNoName = function() {
  return this._name === null;
};

Avatar.prototype.clearName = function() {
  this._name = null;
};

Avatar.prototype.send = function(message) {
  this._socket.send(message);
};

Avatar.prototype.close = function() {
  this._socket.close();
};

Avatar.prototype.setHandler = function(handler) {
  this._handler = handler; 
  this._handler.initialize(this);
};

Avatar.prototype.handle = function(message) {
  this._handler.handle(this, message);
};

var ServerSocket = require('ws').Server,
    port = 6666,
    serverSocket = new ServerSocket({port: port}),
    room = new Room(),
    handler = new NameInputHandler();

serverSocket.on('connection', function(socket) {
  var avatar = new Avatar(socket);
  socket.on('message', (function(message) {
      this.handle(message);
  }).bind(avatar));
  avatar.setHandler(handler);
});

var ConsoleClient = require('./client'),
    consoleClient = new ConsoleClient('ws://localhost:' + port);
consoleClient.start();
