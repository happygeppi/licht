// TODO:
// individual w and h
// rounded mirrors ---) concave or ---( convex
// Spot (goal) --> check if light icts goal
// interface (how to place objects, how to define vertices?)
// levels (auto generate?) --> avoid overlap?

let light;
let spot;
let colors = [];
let things = [[], [], []]; // walls, mirrors, glass object (prisms & lenses)
const nThings = [0, 2, 4];

const NAir = 1;
const NGlass = 1.5; // refractive index

function Start() {
  dj.createCanvas(innerHeight + 1);
  dj.canvas.style.margin = "auto auto";
  dj.bodyBackground(187);

  colors = [
    new ColorRGB(0, 20, 50), // 0: wall
    new ColorRGB(150, 150, 200), // 1: mirror
    new ColorRGB(150, 150, 150, 200), // 2: glass
  ];
  CreateThings();
  Lens(true);
  Lens(false);

  light = new Light(
    dj.vector.new(
      dj.random(50, width - 50),
      dj.random(height / 2, height - 50)
    ),
    dj.random(-PI, PI)
  );

  dj.slower("x");
  dj.faster("y");
}

function Draw() {
  dj.background(51);

  for (let objects of things) for (let thing of objects) thing.update();
  light.update();

  // dj.slower();
}

function CreateWallWalls() {
  CreateThing(0, [
    dj.vector.new(0, 0),
    dj.vector.new(width, 0),
    dj.vector.new(width, 10),
    dj.vector.new(0, 10),
  ]);
  CreateThing(0, [
    dj.vector.new(width, 0),
    dj.vector.new(width, height),
    dj.vector.new(width - 10, height),
    dj.vector.new(width - 10, 0),
  ]);
  CreateThing(0, [
    dj.vector.new(width, height),
    dj.vector.new(0, height),
    dj.vector.new(0, height - 10),
    dj.vector.new(width, height - 10),
  ]);
  CreateThing(0, [
    dj.vector.new(0, height),
    dj.vector.new(0, 0),
    dj.vector.new(10, 0),
    dj.vector.new(10, height),
  ]);
}

function CreateThing(type, verts) {
  if (verts == undefined) {
    const a = dj.random() < 0.5 ? 0 : PI / 2;
    const A = dj.vector.new(dj.random(width), dj.random(height));
    const B = dj.vector.add(dj.vector.polar(dj.random(100, 250), a), A);
    const w = dj.random(10, 20);
    const C = dj.vector.add(B, dj.vector.polar(w, a + PI / 2));
    const D = dj.vector.add(A, dj.vector.polar(w, a + PI / 2));
    verts = [A, B, C, D];
  }

  things[type].push(new Thing(verts, type));
}

function Prism() {
  const middle = dj.mouse.pos;
  const r = 40;
  const verts = [
    dj.vector.add(dj.vector.polar(r, 0), middle),
    dj.vector.add(dj.vector.polar(r, (2 * PI) / 3), middle),
    dj.vector.add(dj.vector.polar(r, (-2 * PI) / 3), middle),
  ];
  CreateThing(2, verts);
}

function Lens(isConcave) {
  if (typeof isConcave == "undefined") return;
  const middle = dj.vector.new(dj.random(width), dj.random(height)); //dj.mouse.pos;
  const arc = PI / 2;
  const r = 50;
  const thiccness = isConcave ? 10 : 0;
  const w = 2 * (r - dj.cos(arc / 2) * r);
  const h = 2 * dj.sin(arc / 2) * r;
  const res = 40;
  const inc = arc / res;
  const off = isConcave ? 1 : -1;

  let s1 = [];
  let s2 = [];

  for (let a = -arc / 2; a < arc / 2 + isConcave * inc; a += inc) {
    s1.push(
      dj.vector.add(
        middle,
        dj.vector.new(
          dj.cos(a) * r - r - (off * w) / 2 + thiccness,
          dj.sin(a) * r
        )
      )
    );
    s2.push(
      dj.vector.add(
        middle,
        dj.vector.new(
          dj.cos(a + PI) * r + r + (off * w) / 2 - thiccness,
          dj.sin(a + PI) * r
        )
      )
    );
  }

  const verts = s1.concat(s2);
  CreateThing(2, verts);
}

function Mirror(isConcave) {
  const middle = dj.mouse.pos;
  const w = 10;
  const arc = PI;
  const r = 100;
  const h = 2 * dj.sin(arc / 2) * r;
  const res = (160 * arc) / PI; // 80 at PI/2, 53 at PI/3, 160 at PI
  const inc = arc / res;

  let s1 = [];
  let s2 = [];

  for (let a = -arc / 2; a <= arc / 2; a += inc) {
    s1.push(dj.vector.add(middle, dj.vector.new(dj.cos(a) * r, dj.sin(a) * r)));
  }
  for (let a = arc / 2; a >= -arc / 2 - 0.5 * inc; a -= inc) {
    s2.push(
      dj.vector.add(
        middle,
        dj.vector.new(dj.cos(a) * (r + w), dj.sin(a) * (r + w))
      )
    );
  }

  const verts = s1.concat(s2);
  CreateThing(1, verts);
}

function CreateThings() {
  CreateWallWalls();
  for (let type = 0; type < things.length; type++)
    for (let i = 0; i < nThings[type]; i++) CreateThing(type);
}
