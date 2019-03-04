//Constructor for Triangles
function Tri(i, dimension, x, y) {
  //Unique indentifier
  this.i = i;

  //State of the Tri
  this.even = i % 2 == 0;
  this.active = false;
  this.opacity = 1;

  //Coordinates of angles
  //Starting wit 90 degree
  this.x = x;
  this.y = y;

  //Other two Coordinates
  //depend on if the hypotenuse
  //is up or down
  if (this.even) {
    // Coord to the right
    this.a = x + dimension;
    this.b = y;
    // Coord to the bottom
    this.m = x;
    this.n = y + dimension;
  } else {
    // Coord to the left
    this.a = x - dimension;
    this.b = y;
    // Coord to the top
    this.m = x;
    this.n = y - dimension;
  }
}

//Helper function to reset Tri and activate it
Tri.prototype.activate = function () {
  this.active = true;
  this.opacity = 1;
}
