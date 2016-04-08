// require 
var WebSocket = require('ws'), ReadLine = require('readline');

// Client Socket
var ClientSocket = function(address) {
  this._socket = new WebSocket(address);
};

ClientSocket.prototype.setOnMessage = function(f) {
  this._socket.on('message', f);
};

ClientSocket.prototype.setOnClose = function(f) {
  this._socket.on('close', f);
};

ClientSocket.prototype.send = function(message) {
  this._socket.send(message);
};

// Console Client
var ConsoleClient = function(address) {
  this._client = new ClientSocket(address);
  this._input = ReadLine.createInterface(process.stdin, process.stdout);
  this._client.setOnMessage(this.onMessage.bind(this));
  this._client.setOnClose(this.onClose.bind(this));
  this._input.on('line', this.onInput.bind(this));
};

ConsoleClient.prototype.onMessage = function(message) {
  console.log(message);
  this._input.prompt();
};

ConsoleClient.prototype.onClose = function() {
  console.log('*** disconnect ***');
  this._input.close();
}

ConsoleClient.prototype.onInput = function(line) {
  if (line === "") {
    this._input.prompt();
  } else {
    this._client.send(line);
  }
};

ConsoleClient.prototype.start = function() {
  this._input.prompt();
};

module.exports = ConsoleClient;
