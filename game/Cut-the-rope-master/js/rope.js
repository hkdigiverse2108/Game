class Rope {
  constructor(position, ropePoints, lineSegmentLength) {
    this.points = [];
    this.constraints = [];
    this.position = position;
    this.ropePoints = ropePoints;
    this.lineSegmentLength = lineSegmentLength;
    this.isAlreadyCut = false;

    for (let eachRopePoint = 0; eachRopePoint < ropePoints; eachRopePoint++) {
      this.points.push(new Point(
        new Vec2(position.x, position.y + eachRopePoint * lineSegmentLength)
      ));
    }

    for (let eachRopePoint = 0; eachRopePoint < ropePoints - 1; eachRopePoint++) {
      this.constraints.push(
        new PointConstraint(this.points[eachRopePoint], this.points[eachRopePoint + 1])
      );
    }

    this.setPinned(true);
  }
  setPinned(value) {
    // this.pinned = value;
    this.points[0].pinned = value;
  }
  getRopeEnd() {
    return this.points[this.points.length - 1];
  }

  getConstraintEnd() {
    return this.constraints[this.constraints.length - 1];
  }

  attach(point) {
    this.constraints.push(new PointConstraint(this.getRopeEnd(), point));
    this.getConstraintEnd().setLength(this.lineSegmentLength);

  }

  updatePoints() {
    if (this.points.length != 0) {
      this.points[0].position = this.position;
      for (let point of this.points) {
        point.update();
      }
    }
  }

  updateFriction() {
    for (let point of this.points) {
      point.updateFriction();
    }
  }
  updateGravity() {
    let lastPoint = this.points.length - 1;
    this.points[lastPoint].setGravity(new Vec2(0, 8));
  }

  updateConstraints() {
    for (let constraint of this.constraints) {
      constraint.update();
    }
  }

  checkRopesIntersection(mousePositionX, mousePositionY) {
    if (!this.isAlreadyCut) {
      for (let constraint of this.constraints) {
        let lengthOfLine = constraint.pointA.position.vecTo(constraint.pointB.position).len();
        let distanceFromPointA = new Vec2(mousePositionX, mousePositionY).vecTo(constraint.pointA.position).len(),
          distanceFromPointB = new Vec2(mousePositionX, mousePositionY).vecTo(constraint.pointB.position).len();
        if (distanceFromPointA + distanceFromPointB >= lengthOfLine - 2.5 &&
          distanceFromPointA + distanceFromPointB <= lengthOfLine + 2.5) {
          if (this.constraints.indexOf(constraint) != 0 && this.constraints.indexOf(constraint) != this.constraints.length - 2
            && this.constraints.indexOf(constraint) != this.constraints.length - 3) {
            this.isAlreadyCut = true;
            this.removeConstraint(this.constraints.indexOf(constraint));
            this.removeConstraint(this.constraints.length - 2);
            this.removePoints(this.points.indexOf(constraint.pointA), this.points.indexOf(constraint.pointB));
            ropeCutSound.play();
            this.updateConstraintsOpacity();
            // this.updateGravity();
          }
        }
      }
    }
  }

  removeConstraint(index) {
    this.constraints.splice(index, 1);
  }

  removePoints(pointA, pointB) {
    this.points.splice(pointA, 1);
    this.points.splice(pointB, 1);
  }

  updateConstraintsOpacity() {
    for (let constraint of this.constraints) {
      constraint.updateOpacity();
    }
  }

  render() {
    if (this.constraints.length != 0) {
      for (let constraint of this.constraints) {
        constraint.render();
      }
    }
  }
}