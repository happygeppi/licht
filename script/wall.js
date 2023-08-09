class Thing {
  constructor(verts, type, color = colors[type]) {
    this.verts = verts;
    this.type = type;
    this.color = color;
    this.createLines();
  }

  createLines() {
    this.lines = [];
    this.verts.forEach((v, i) => {
      if (i !== this.verts.length - 1) {
        this.lines.push([v, this.verts[i + 1]]);
      } else {
        this.lines.push([v, this.verts[0]]);
      }
    });
  }

  update() {
    this.show();
  }

  show() {
    dj.fill(this.color);
    dj.strokeWeight(0);
    dj.polygon(this.verts, false);
  }
}
