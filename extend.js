Object.defineProperty(Object.prototype, 'inherit', { value: function(parent) {
  var F = function(){};
  F.prototype = parent.prototype;
  this.prototype = new F();
  this.prototype.constructer = this;
  this.prototype._super = parent;
}});
