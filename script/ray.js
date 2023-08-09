class Ray {
  constructor(pos, dir) {
    this.pos = pos;
    this.dir = dir;

    this.ict = dj.vector.new();
    this.line = dj.vector.new();
  }

  cast(things) {
    let icts = [];

    for (let thing of things) {
      icts.push(this.checkIct(thing));
    }

    this.ict = this.findClosest(icts);
    if (typeof this.ict == "object") this.line = dj.vector.sub(this.ict.pos, this.pos);
  }

  findClosest(icts) {
    let minD = Infinity;
    let closest = icts[0];

    for (let ict of icts) {
      if (typeof ict == "object") {
        let d = dj.dist(this.pos, ict.pos);
        if (d < minD) {
          minD = d;
          closest = ict;
        }
      }
    }

    return closest;
  }

  checkIct(thing) {
    let ict = dj.vector.new();
    const obj = thing.obj;
    const line = thing.line;

    const x1 = line[0].x;
    const y1 = line[0].y;
    const x2 = line[1].x;
    const y2 = line[1].y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + dj.cos(this.dir);
    const y4 = this.pos.y + dj.sin(this.dir);

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      ict.x = x1 + t * (x2 - x1);
      ict.y = y1 + t * (y2 - y1);
      return {
        pos: ict,
        obj: obj,
        line: line
      };
    } else return
  }

  show() {
    dj.resetTransform();
    dj.stroke(255);
    dj.strokeWeight(1);
    if (this.ict) dj.line(this.pos, this.ict);
  }
}