class Light {
  constructor(pos, dir, r = 16) {
    this.pos = pos; // vector
    this.dir = dir; // angle
    this.r = r;
    this.medium = NAir;

    this.beams = [];
    this.nBeams = 20;
    this.nBounces = 50;

    this.createBeams();
  }

  update() {
    this.cheat();
    this.checkBeams();
    this.show();
  }

  cheat() {
    this.pos = dj.keyDown(" ") ? dj.mouse.pos : this.pos;
    if (dj.keyDown("a", "ArrowLeft")) this.dir -= 0.02;
    if (dj.keyDown("d", "ArrowRight")) this.dir += 0.02;
  }

  createBeams() {
    this.beams = [];
    for (let i = 0; i < this.nBeams; i++) {
      const off = dj.map(i, 0, this.nBeams - 1, 0, this.r * 2);
      const pos = dj.vector.add(
        this.pos,
        dj.vector.polar(off - this.r, this.dir + PI / 2)
      );
      this.beams.push([new Ray(pos, this.dir)]);
    }
  }

  collectLines() {
    let thingLines = [];

    for (let objects of things) {
      for (let thing of objects) {
        for (let line of thing.lines) {
          thingLines.push({
            line: line,
            obj: thing, // copy() ?
          });
        }
      }
    }

    return thingLines;
  }

  // aBorder: angle of border of object, ain: angle of incoming ray
  reflect = (aBorder, ain) => [2 * aBorder - ain, false];

  // n1: refractive index of current medium of light, n2: refr. in. of other medium
  refract(aBorder, ain, n1, n2) {
    aBorder = this.adjust(aBorder, ain);
    const al1 = aBorder + PI / 2 - ain; // am Lot, Medium 1
    const al2 = dj.asin((dj.sin(al1) * n1) / n2); // am Lot, Medium 2

    if (isNaN(al2)) return this.reflect(aBorder, ain);

    return [aBorder + PI / 2 - al2, true];
  }

  adjust(ab, ain) {
    while (ab < ain) ab += 2 * PI;
    while (ab > ain) ab -= PI;
    return ab;
  }

  nextBeam(j) {
    const beam = this.beams[j][this.beams[j].length - 1];
    const obj = beam.ict.obj;
    const line = beam.ict.line;
    const objA = dj.atan(line[1].y - line[0].y, line[1].x - line[0].x);
    let a2;

    if (obj.type !== 0) {
      if (obj.type == 1) {
        // mirror
        a2 = this.reflect(objA, beam.dir);
      } else if (obj.type == 2) {
        // glass object
        const N2 = this.medium == NAir ? NGlass : NAir;
        a2 = this.refract(objA, beam.dir, this.medium, N2);
        if (a2[1]) this.medium = N2; // check if it has actually changed!
      }

      const off = dj.vector.polar(0.1, a2[0]);
      const nextBeam = new Ray(dj.vector.add(beam.ict.pos, off), a2[0]);
      this.beams[j].push(nextBeam);

      return true;
    }

    return false;
  }

  checkBeams() {
    this.createBeams();

    const lines = this.collectLines();
    dj.setColorMode(HSL);
    this.beams.forEach((path, j) => {
      let i = 0;
      this.medium = NAir;
      do {
        path[i].cast(lines);
        i++;
      } while (i < this.nBounces && this.nextBeam(j));
      if (dj.keyDown("c")) console.log(i);
    });

    dj.setColorMode(RGB);
  }

  showSource() {
    dj.fill(255);
    dj.circle(this.pos.x, this.pos.y, this.r);
  }

  show() {
    this.showSource();
    dj.strokeWeight(1);
    dj.stroke(255, 255, 255, 150);
    for (let path of this.beams) {
      path.forEach((part, i) => {
        dj.line(part.pos, part.ict.pos);
      });
    }
  }
}

function Angle(a) {
  const V = dj.vector.polar(20, a);
  dj.stroke(0, 255, 0);
  dj.strokeWeight(1);
  dj.line(dj.mouse.pos, dj.vector.add(dj.mouse.pos, V));
}

function Arc(start, arclength) {
  dj.ctx.beginPath();
  dj.ctx.arc(dj.mouse.x, dj.mouse.y, 10, start, start + arclength);
  dj.strokeWeight(0, 255, 0);
  dj.ctx.stroke();
  dj.ctx.closePath();
}
