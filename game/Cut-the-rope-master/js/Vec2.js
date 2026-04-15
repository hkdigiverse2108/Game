class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  equal(vec) /* check if two vectors are equal */ {
    return this.x == vec.x && this.y == vec.y;
  }
  norm() /*normalized vector with length of 1 */ {
    var len = this.len();
    return new Vec2(this.x / len, this.y / len);
  }
  resize(len) /*resized vector to given length */ {
    return this.norm().scale(len);
  }
  scale(fac) /*scaled vector */ {
    return new Vec2(this.x * fac, this.y * fac);
  }
  distance(vec) /*distance between this and argument vector*/ {
    var dx = this.x - vec.x;
    var dy = this.y - vec.y
    return Math.sqrt(dx * dx + dy * dy);
  }
  len() /*length of the vector */ {
    return Math.sqrt(this.lenSqrt());
  }
  lenSqrt() /*non squareroot length of the vector*/ {
    return this.x * this.x + this.y * this.y;
  }
  toArray() /* casts vector to array where x is index 0 and y is index 1 */ {
    return [...this];
  }
  flip() /* flips x and y coordinates */ {
    return new Vec2(this.y, this.x);
  }
  copy() /* returns hard copied vector */ {
    return new Vec2(this.x, this.y);
  }
  sub(vec) /* substracts this-vec */ {
    return new Vec2(this.x - vec.x, this.y - vec.y);
  }
  rotatePointAround(vecPoint, rad) /*rotates vector point around this vector (point) by given radians and returns its new absolute position*/ {
    var rot_vec = this.vecTo(vecPoint);
    var rotatedVec = rot_vec.rotate(rad);
    return this.add(rotatedVec);
  }
  rotate(rad) /*rotates vector by radians*/ {
    var cs = Math.cos(rad);
    var sn = Math.sin(rad);
    return new Vec2(this.x * cs - this.y * sn, this.x * sn + this.y * cs);
  }
  add(vec) /* sums this + vec */ {
    return new Vec2(this.x + vec.x, this.y + vec.y);
  }
  angle(vec) /* returns cosine angle [0-PI] between this and vec */ {
    return Math.acos(this.scalar(vec) / (this.len() * vec.len()));
  }
  fullAngle(vec) /* returns full angle [0-2PI) between this and vec */ {
    return Math.atan2(this.det(vec), this.dot(vec));
  }
  det(vec) /* returns determinant of two vectors */ {
    return this.cross(vec);
  }
  vecTo(vec) /* gets new vector from this to vec */ {
    return vec.sub(this);
  }
  scalar(vec) /* scalar product with this*vec */ {
    return this.x * vec.x + this.y * vec.y;
  }
  dot(vec) /*dot product with this*vec, actual scalar product*/ {
    return this.scalar(vec);
  }
  cross(vec) /* cross product with this x vec */ {
    return this.x * vec.y - this.y * vec.x;
  }
  negate() /* negates the vector */ {
    return new Vec2(-this.x, -this.y);
  }
}