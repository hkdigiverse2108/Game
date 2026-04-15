class Point {
  constructor(position, velocity = new Vec2(0, 0)) {
    this.max_velocity = 40;
    this.pinned = false;
    this.friction = 0.6;
    this.gravity = new Vec2(0, 0.2);
    this.position = position;
    this.setVelocity(velocity);

  }
  setVelocity(velocity) {
    this.prevPosition = this.position.sub(velocity);
  }
  getVelocity() {
    return this.prevPosition.vecTo(this.position);
  }
  // setPinned(value) {
  //   this.pinned = value;
  //   return this;
  // }

  setGravity(value) {
    this.gravity = value;
  }

  updateFriction() {
    if (this.position.y == CANVAS_HEIGHT) {
      var vel = this.getVelocity();
      vel.x *= this.friction;
      this.setVelocity(vel);
    }
  }
  updateBoundings() {
    var vel = this.getVelocity();
    if (this.position.x > CANVAS_WIDTH) {
      this.position.x = CANVAS_WIDTH;
      this.prevPosition.x = this.position.x + vel.x;
    }
    if (this.position.x < 0) {
      this.position.x = 0;
      this.prevPosition.x = this.position.x + vel.x;
    }
    if (this.position.y < 0) {
      this.position.y = 0;
      this.prevPosition.y = this.position.y + vel.y;
    }

    if (this.position.y > CANVAS_HEIGHT) {
      this.position.y = CANVAS_HEIGHT;
      this.prevPosition.y = this.position.y + vel.y;
    }
  }
  update() {
    if (this.pinned)
      return;
    var vel = this.getVelocity();
    this.prevPosition = this.position.copy();
    this.position = this.position.add(vel).add(this.gravity);

    vel = this.getVelocity();

    if (vel.len() > this.max_velocity)
      this.setVelocity(vel.resize(this.max_velocity));

  }
}
