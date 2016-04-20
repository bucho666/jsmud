Object.defineProperty(Object.prototype, 'inherit', { value: function(parent) {
  var F = function(){};
  F.prototype = parent.prototype;
  this.prototype = new F();
  this.prototype.constructer = this;
  this.prototype._super = parent;
}});

Object.defineProperty(Array.prototype, 'remove', {
  value: function(element) {
  var index = this.indexOf(element);
  if (index === -1) return;
  this.splice(index, 1);
}});

Object.defineProperty(Array.prototype, 'has', {
  value: function(item) {
  return this.indexOf(item) >= 0;
}});
