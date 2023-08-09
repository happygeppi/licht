// TODO:
// translated(point) only if stuff is translated
// rectMode(CENTER)
// max(array), min(array)
// angle(line)
// Vector3
// cuboid, project
// random = (args) => dj.random(args) for all funcs!!!

class DJ {
  constructor() {
    this.running = 1;
    this.framecount = 0;
    this.checkFR = false;
    this.recentFrames = [0, 0];
    this.body = document.body;
    this.fullw = innerWidth;
    this.fullh = innerHeight;
    this.colorMode = RGB;
    this.fillOrNot = true;
    this.vector = new _VectorMath();
    this.vector3 = new _Vector3Math();
    this.rot = 0;
    this.rotAxes = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.off = null;
    this.time = new _Date();
    this.keysDown = [];
    this.keysPressed = [];
    this.keysReleased = [];
    this.A = 7 ** 5;
    this.C = 1;
    this.M = 2 ** 31 - 1;
    this.seed = this.time.millis;
    this.noise = new _SimplexNoise();
  }

  createCanvas(_w, _h) {
    this.canvas = document.createElement("canvas");
    this.body.appendChild(this.canvas);
    this.canvas.id = "TheCanvas";

    this.canvas.style.margin = `0px`;
    this.body.style.margin = `0px`;
    this.body.style.padding = `0px`;
    this.body.style.overflow = "hidden";

    if (_w == FULL) {
      _w = this.fullw;
      _h = this.fullh + 1;
    } else if (_h == undefined) _h = _w;

    this.canvas.width = _w;
    this.canvas.height = _h;

    this.ctx = this.canvas.getContext("2d");
    this.canvasRect = this.canvas.getBoundingClientRect();

    this.stroke(255);
    this.strokeWeight(2);
    this.fill(255);

    width = _w;
    height = _h;

    MIDDLE = this.vector.new(width / 2, height / 2);

    this.canvas.addEventListener("mousemove", (e) => this.mouse.update(e));
    this.canvas.addEventListener("mousedown", () => (this.mouse.down = true));
    this.canvas.addEventListener("mouseup", () => (this.mouse.down = false));
    this.canvas.addEventListener("click", () => (this.mouse.click = true));
  }

  background() {
    this.ctx.fillStyle = this.getColor(arguments, true);
    this.ctx.fillRect(0, 0, width, height);
  }
  bodyBackground() {
    this.body.style.backgroundColor = this.getColor(arguments, false);
  }
  getColor(args, _alpha) {
    let _c = [0, 0, 0, 255];

    if (typeof args[0] == "object") {
      if (args[0].r !== undefined) {
        const _a = args[0].a ? args[0].a : 255;
        args = [args[0].r, args[0].g, args[0].b, _a];
      } else if (args[0].h !== undefined) {
        const _a = args[0].a ? args[0].a : 255;
        args = [args[0].h, args[0].s, args[0].l, _a];
      } else args = args[0];
    }

    if (args[0] == NONE) {
      FILLING = false;
      return `rgba(0, 0, 0, 0)`;
    } else if (this.colorMode == HEX) return `#${args[0]}`;
    else {
      FILLING = true;

      if (args.length == 0) {
        _c[0] = 0;
        _c[1] = 0;
        _c[2] = 0;
        _c[3] = 255;
      } else if (args.length == 1) {
        if (this.colorMode == RGB) _c[0] = _c[1] = _c[2] = args[0];
        else if (this.colorMode == HSL) {
          _c[0] = _c[1] = 0;
          _c[2] = args[0];
        }
        _c[3] = 255;
      } else if (args.length == 2) {
        if (this.colorMode == RGB) _c[0] = _c[1] = _c[2] = args[0];
        else if (this.colorMode == HSL) {
          _c[0] = _c[1] = 0;
          _c[2] = args[0];
        }
        _c[3] = args[1];
      } else if (args.length == 3) {
        _c[0] = args[0];
        _c[1] = args[1];
        _c[2] = args[2];
        _c[3] = 255;
      } else if (args.length == 4 && _alpha) {
        _c[0] = args[0];
        _c[1] = args[1];
        _c[2] = args[2];
        _c[3] = args[3];
      }

      if (this.colorMode == HSL) _c = this.HSLtoRGB(_c);
    }

    return `rgba(${_c[0]}, ${_c[1]}, ${_c[2]}, ${_c[3] / 255})`;
  }
  dataToPixels() {
    this.px = [];
    for (let _y = 0; _y < height; _y++) {
      this.px.push([]);
      for (let _x = 0; _x < width; _x++) {
        const _index = 4 * (width * _y + _x);
        this.px[_y].push(
          new ColorRGB(
            this.pxData[_index],
            this.pxData[_index + 1],
            this.pxData[_index + 2],
            this.pxData[_index + 3]
          )
        );
      }
    }
  }
  pixelsToData() {
    let _data = [];
    for (let _row of this.px)
      for (let _px of _row) _data.push(_px.r, _px.g, _px.b, _px.a);
    this.pxData = Uint8ClampedArray.from(_data);
  }
  loadPx() {
    this.pxData = this.ctx.getImageData(0, 0, width, height).data;
    this.dataToPixels();
  }
  updatePx() {
    this.pixelsToData();
    const _data = new ImageData(this.pxData, width, height);
    this.ctx.putImageData(_data, 0, 0);
  }
  fill() {
    this.ctx.fillStyle = this.getColor(arguments, true);
  }
  stroke() {
    this.ctx.strokeStyle = this.getColor(arguments, true);
  }
  strokeWeight = (_sw) => (this.ctx.lineWidth = _sw);
  setColorMode = (_mode) => (this.colorMode = _mode);
  HSLtoRGB(_c) {
    const _h = _c[0];
    const _s = _c[1] / 100;
    const _l = _c[2] / 100;
    const _a = _s * this.min(_l, 1 - _l);
    const _f = (_n, _k = (_n + _h / 30) % 12) =>
      this.round((_l - _a * this.max(this.min(_k - 3, 9 - _k, 1), -1)) * 255);
    return [_f(0), _f(8), _f(4), _c[3]];
  }

  rect(_x, _y, _w, _h, _s) {
    const _v1 = this.translatePoint(this.vector.new(_x, _y));
    const _v2 = this.translatePoint(this.vector.new(_x + _w, _y));
    const _v3 = this.translatePoint(this.vector.new(_x + _w, _y + _h));
    const _v4 = this.translatePoint(this.vector.new(_x, _y + _h));
    this.polygon(_v1, _v2, _v3, _v4, _s);
  }
  circle(_x, _y, _r, _s) {
    this.translatePoint(this.vector.new(_x, _y));
    this.ctx.beginPath();
    if (_r >= 0) this.ctx.arc(_x, _y, _r, 0, PI * 2);
    if (FILLING) this.ctx.fill();
    if (_s) this.ctx.stroke();
    this.ctx.closePath();
  }
  triangle() {
    const args = arguments;
    let _v1, _v2, _v3, _s;

    if (args.length == 4) {
      _v1 = args[0];
      _v2 = args[1];
      _v3 = args[2];
      _s = args[3];
    } else if (args.length == 7) {
      _v1 = this.vector.new(args[0], args[1]);
      _v2 = this.vector.new(args[2], args[3]);
      _v3 = this.vector.new(args[4], args[5]);
      _s = args[6];
    }

    _v1 = this.translatePoint(_v1);
    _v2 = this.translatePoint(_v2);
    _v3 = this.translatePoint(_v3);

    this.ctx.beginPath();
    this.ctx.moveTo(_v1.x, _v1.y);
    this.ctx.lineTo(_v2.x, _v2.y);
    this.ctx.lineTo(_v3.x, _v3.y);
    this.ctx.lineTo(_v1.x, _v1.y);
    this.ctx.lineTo(_v2.x, _v2.y);
    if (FILLING) this.ctx.fill();
    if (_s) this.ctx.stroke();
    this.ctx.closePath();
  }
  line() {
    const args = arguments;
    let _v1, _v2;

    if (args.length == 2) {
      _v1 = this.translatePoint(args[0]);
      _v2 = this.translatePoint(args[1]);
    } else if (args.length == 4) {
      _v1 = this.translatePoint(this.vector.new(args[0], args[1]));
      _v2 = this.translatePoint(this.vector.new(args[2], args[3]));
    }

    this.ctx.beginPath();
    this.ctx.moveTo(_v1.x, _v1.y);
    this.ctx.lineTo(_v2.x, _v2.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }
  point() {
    const args = arguments;
    let _v;

    if (args.length == 1) {
      _v = this.translatePoint(args[0]);
    } else if (args.length == 2) {
      _v = this.vector.new(args[0], args[1]);
      _v = this.translatePoint(_v);
    }

    this.ctx.beginPath();
    this.ctx.arc(_v.x, _v.y, Math.ceil(this.ctx.lineWidth / 2), 0, PI * 2);
    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.fill();
    this.ctx.closePath();
  }
  polygon() {
    const args = arguments;
    let _verts = [];
    let _s;

    if (args.length == 2) {
      _verts = args[0];
      _s = args[1];
    } else {
      _s = args[args.length - 1];
      _verts = args.copy().toArray();
      _verts.splice(_verts.length - 1, 1);
    }

    if (_verts.length == 0) return;
    if (_verts.length == 1) return this.point(_verts[0]);

    for (let vert of _verts) vert = this.translatePoint(vert);

    this.ctx.beginPath();
    this.ctx.moveTo(_verts[0].x, _verts[0].y);
    for (let i = 1; i < _verts.length; i++)
      this.ctx.lineTo(_verts[i].x, _verts[i].y);
    this.ctx.lineTo(_verts[0].x, _verts[0].y);
    this.ctx.lineTo(_verts[1].x, _verts[1].y);
    this.ctx.fill();
    if (_s) this.ctx.stroke();
    this.ctx.closePath();
  }
  lines() {
    const args = arguments;
    let _verts = [];

    if (args.length == 1) _verts = args[0];
    else _verts = args.copy().toArray();

    if (_verts.length == 0) return;
    if (_verts.length == 1) return this.point(_verts[0]);

    for (let vert of _verts) vert = this.translatePoint(vert);

    this.ctx.beginPath();
    this.ctx.moveTo(_verts[0].x, _verts[0].y);
    for (let i = 1; i < _verts.length; i++)
      this.ctx.lineTo(_verts[i].x, _verts[i].y);
    this.ctx.stroke();
    this.ctx.closePath();
  }
  translatePoint = (_v) => _v.copy().rotate(this.rot).add(this.off);

  floor = (_n) => Math.floor(_n);
  ceil = (_n) => Math.ceil(_n);
  round = (_n) => Math.round(_n);
  max = (_a, _b) => Math.max(_a, _b);
  min = (_a, _b) => Math.min(_a, _b);
  abs = (_n) => Math.abs(_n);
  sin = (_a) => Math.sin(_a);
  asin = (_x) => Math.asin(_x);
  cos = (_a) => Math.cos(_a);
  acos = (_x) => Math.acos(_x);
  tan = (_a) => Math.tan(_a);
  atan = (_opp, _adj) => Math.atan2(_opp, _adj);
  pow = (_n, _m) => Math.pow(_n, _m);
  sqrt = (_n) => Math.sqrt(_n);

  dist() {
    const args = arguments;
    let _x1, _y1, _x2, _y2;

    if (args.length == 2) {
      _x1 = args[0].x;
      _y1 = args[0].y;
      _x2 = args[1].x;
      _y2 = args[1].y;
    } else if (args.length == 4) {
      _x1 = args[0];
      _y1 = args[1];
      _x2 = args[2];
      _y2 = args[3];
    }

    return this.sqrt(this.pow(_x2 - _x1, 2) + this.pow(_y2 - _y1, 2));
  }
  dist3() {
    const args = arguments;
    let _x1, _y1, _z1, _x2, _y2, _z2;

    if (args.length == 2) {
      _x1 = args[0].x;
      _y1 = args[0].y;
      _z1 = args[0].z;
      _x2 = args[1].x;
      _y2 = args[1].y;
      _z2 = args[1].z;
    } else if (args.length == 6) {
      _x1 = args[0];
      _y1 = args[1];
      _z1 = args[2];
      _x2 = args[3];
      _y2 = args[4];
      _z2 = args[5];
    }

    return this.sqrt(
      this.pow(_x2 - _x1, 2) + this.pow(_y2 - _y1, 2) + this.pow(_z2 - _z1, 2)
    );
  }
  randomGeneral(args, _val) {
    let _min, _max;

    if (args.length == 0) return _val;

    if (typeof args[0] == "number") {
      if (args.length == 1 && typeof args[0] == "number") {
        _min = 0;
        _max = args[0];
      } else if (args.length == 2) {
        _min = args[0];
        _max = args[1];
      }

      return _val * (_max - _min) + _min;
    } else if (typeof args[0] == "object") {
      return args[0][this.floor(_val * args[0].length)];
    }
  }
  JSrandom() {
    this.randomGeneral(arguments, Math.random());
  }
  setSeed(_s) {
    this.seed = _s;
    this.recentRandom = undefined;
  }
  random() {
    this.recentRandom = this.recentRandom ? this.recentRandom : this.seed;
    this.recentRandom = (this.A * this.recentRandom + this.C) % this.M;
    return this.randomGeneral(arguments, this.recentRandom / this.M);
  }
  map = (_val1, _min1, _max1, _min2, _max2) =>
    ((_val1 - _min1) / (_max1 - _min1)) * (_max2 - _min2) + _min2;
  average() {
    const args = arguments;
    let _nums = [];
    if (typeof args[0] == "object") _nums = args[0];
    else _nums = args;
    let _sum = 0;
    for (let _num of _nums) _sum += _num;
    return _sum / _nums.length;
  }
  constrain(_n, _min, _max) {
    if (_n > _max) _n = _max;
    if (_n < _min) _n = _min;
    return _n;
  }
  getAngle() {
    const args = arguments.copy().toArray();
    let A, B;
    if (args.length == 1) {
      A = args[0][0];
      B = args[0][1];
    } else if (args.length == 2) {
      A = args[0];
      B = args[1];
    }
    return this.atan(B.y - A.y, B.x - A.x);
  }
  copyArray(_arr) {
    let _newArr = [];
    for (let elem of _arr) _newArr.push(elem);
    return _newArr;
  }

  vecToMat = (_v) =>
    _v.z !== undefined ? [[_v.x], [_v.y], [_v.z]] : [[_v.x], [_v.y]];
  matToVec = (_M) =>
    _M.length == 3
      ? this.vector3.new(_M[0][0], _M[1][0], _M[2][0])
      : this.vector.new(_M[0][0], _M[1][0]);
  matMult(_a, _b) {
    let _result = [];
    for (let i = 0; i < _a.length; i++) {
      _result.push([]);
      for (let j = 0; j < _b[0].length; j++) {
        let _sum = 0;
        for (let k = 0; k < _a[0].length; k++) _sum += _a[i][k] * _b[k][j];
        _result[i][j] = _sum;
      }
    }
    return _result;
  }

  translate() {
    if (arguments.length == 1) this.off = arguments[0].copy();
    else {
      this.off.x = arguments[0];
      this.off.y = arguments[1];
    }
  }
  rotateX = (_a) => (this.rotAxes.x = _a);
  rotateY = (_a) => (this.rotAxes.y = _a);
  rotateZ = (_a) => (this.rotAxes.z = _a);
  rotate = (_a) => (this.rot = _a);
  rotatedX(_v, _a) {
    const _rotMat = [
      [1, 0, 0],
      [0, this.cos(_a), -this.sin(_a)],
      [0, this.sin(_a), this.cos(_a)],
    ];
    return this.matToVec(this.MatMult(_rotMat, this.vecToMat(_v)));
  }
  rotatedY(_v, _a) {
    const _rotMat = [
      [this.cos(_a), 0, -this.sin(_a)],
      [0, 1, 0],
      [this.sin(_a), 0, this.cos(_a), 0],
    ];
    return this.matToVec(this.MatMult(_rotMat, this.vecToMat(_v)));
  }
  rotatedZ(_v, _a) {
    const _rotMat = [
      [this.cos(_a), -this.sin(_a), 0],
      [this.sin(_a), this.cos(_a), 0],
      [0, 0, 1],
    ];
    return this.matToVec(this.MatMult(_rotMat, this.vecToMat(_v)));
  }
  resetTransform() {
    this.off.set();
    this.rotAxes = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.rot = 0;
  }

  cuboid() {
    const args = arguments;
    let _pos, _w, _h, _l, _se, _sp;

    _pos = args[0];
    _w = args[1];

    if (args.length == 4) {
      _h = _w;
      _l = _w;
      _se = args[2];
      _sp = args[3];
    } else if (args.length == 6) {
      _h = args[2];
      _l = args[3];
      _se = args[4];
      _sp = args[5];
    }

    let _vertices = [];
    let _v2d = [];

    _vertices.push(this.vector3.new(_pos.x, _pos.y, _pos.z));
    _vertices.push(this.vector3.new(_pos.x + _w, _pos.y, _pos.z));
    _vertices.push(this.vector3.new(_pos.x + _w, _pos.y + _h, _pos.z));
    _vertices.push(this.vector3.new(_pos.x, _pos.y + _h, _pos.z));

    _vertices.push(this.vector3.new(_pos.x, _pos.y, _pos.z + _l));
    _vertices.push(this.vector3.new(_pos.x + _w, _pos.y, _pos.z + _l));
    _vertices.push(this.vector3.new(_pos.x + _w, _pos.y + _h, _pos.z + _l));
    _vertices.push(this.vector3.new(_pos.x, _pos.y + _h, _pos.z + _l));

    // translated() ?
    _vertices.forEach((_v) => _v2d.push(this.project3d2d(_v)));

    this.strokeWeight(_se);
    for (let i = 0; i < 4; i++) {
      this.line(_v2d[i], _v2d[(i + 1) % 4]);
      this.line(_v2d[i + 4], _v2d[((i + 1) % 4) + 4]);
      this.line(_v2d[i], _v2d[i + 4]);
    }

    this.strokeWeight(_sp);
    _v2d.forEach((_v) => this.point(_v));
  }
  project3d2d(_v3d) {
    const _p = this.vector3.new();

    let _fov = fov || PI / 4;

    _p.x = _v3d.x - this.off.x;
    _p.y = _v3d.y - this.off.y;
    _p.z = _v3d.z; // - this.off.z;

    if (this.rotAxes.x !== 0) _p = this.rotatedX(_p, this.rotAxes.x);
    if (this.rotAxes.y !== 0) _p = this.rotatedY(_p, this.rotAxes.y);
    if (this.rotAxes.z !== 0) _p = this.rotatedZ(_p, this.rotAxes.z);

    _p.x -= eye.x;
    _p.y -= eye.y;
    _p.z -= eye.z - znear;

    const _v2d = this.vector.new();

    const _den = 2 * _p.z * this.abs(this.tan(_fov / 2));
    const _smaller = width > height ? height : width;
    _v2d.x = (_p.x * _smaller) / _den + width / 2;
    _v2d.y = (_p.y * _smaller) / _den + height / 2;

    return _v2d;
  }

  lineVertices(_A, _B, _res) {
    let _vertices = [];
    const _diff = this.vector.sub(_A, _B);
    const _len = _diff.l;

    _vertices.push(this.vector.new());
    for (let _l = _res; _l < _len; _l += _res) {
      const x = _diff.x * (_l / _len);
      const y = _diff.y * (_l / _len);

      _vertices.push(this.vector.new(x, y));
    }
    _vertices.push(_diff);

    return _vertices;
  }
  collisionRectPoint = (_rect, _p) =>
    _p.x >= _rect.x &&
    _p.x <= _rect.x + _rect._w &&
    _p.y >= _rect.y &&
    _p.y <= _rect.y + _rect._h;
  collisionRectRect = (_hb1, _hb2) =>
    _hb1.x <= _hb2.x + _hb2._w &&
    _hb1.x + _hb1._w >= _hb2.x &&
    _hb1.y <= _hb2.y + _hb2._h &&
    _hb1.y + _hb1._h >= _hb2.y;
  collisionCircleCircle = (_hb1, _hb2) =>
    dist(_hb1.x, _hb1.y, _hb2.x, _hb2.y) <= _hb1._r + _hb2._r;
  // TODO: refactor collisionRectRect() !
  // TODO: function collisionRectCircle(_hb1, _hb2)
  // TODO: function collisionPolygonPolygon(_hb1, _hb2) mit Raycasting

  startTimer = () => (this.timeA = new Date());
  stopTimer() {
    this.timeB = new Date();
    return (this.stopwatch = timeBetween(this.timeA, this.timeB));
  }
  timeBetween(_A, _B) {
    const aMillis = _A.getTime() + _A.getMilliseconds();
    const bMillis = _B.getTime() + _B.getMilliseconds();
    return (bMillis - aMillis) / 1000;
  }

  keyDown() {
    const args = arguments.copy().toArray();
    for (let _key of args) if (this.keysDown.includes(_key)) return true;
    return false;
  }
  keyPressed() {
    const args = arguments.copy().toArray();
    for (let _key of args) if (this.keysPressed.includes(_key)) return true;
    return false;
  }
  keyReleased() {
    const args = arguments.copy().toArray();
    for (let _key of args) if (this.keysReleased.includes(_key)) return true;
    return false;
  }

  saveJSON(_content, _name) {
    const _data = JSON.stringify(_content);
    const _a = document.createElement("a");
    const _file = new Blob([_data]);
    _a.href = URL.createObjectURL(_file);
    _a.download = _name;
    _a.click();
  }
  saveText(_content, _name) {
    const _a = document.createElement("a");
    const _file = new Blob([_content]);
    _a.href = URL.createObjectURL(_file);
    _a.download = _name;
    _a.click();
  }
  saveCanvas(_name) {
    this.time.update();
    _name =
      _name ||
      `canvas${this.time.year}${this.time.month + 1}${this.time.day}_${
        this.time.hour
      }${this.time.minute}${this.time.seconds}`;

    this.canvas.toBlob((_blob) => {
      const _url = URL.createObjectURL(_blob);
      const _a = document.createElement("a");
      _a.href = _url;
      _a.download = _name;
      _a.click();
    });
  }

  slower() {
    this.stopCdts = arguments.toArray();
    if (arguments.length == 0) this.stopCdts = [1];
  }
  faster() {
    this.updateCdts = arguments.toArray();
    if (arguments.length == 0) this.updateCdts = [1];
  }
  cancel = () => (this.running > 0 ? this.running-- : undefined);
  addUpdater = () => this.running++;
  doSthIfCondition(_cdts, func) {
    if (_cdts == undefined) return;
    if (_cdts[0] == 1) return func();

    _cdts.forEach((_cdt) => {
      if ((_cdt == CLICK && this.mouse.down) || this.keyPressed(_cdt)) func();
    });
  }
  checkFramerate = () => (this.checkFR = true);
  checkRunning() {
    this.doSthIfCondition(this.stopCdts, this.cancel);
    this.doSthIfCondition(this.updateCdts, this.addUpdater);
  }
  handleInput() {
    if (this.mouse.click) this.mouse.click = false;
    this.keysPressed = [];
    this.keysReleased = [];
  }
  checkPerformance() {
    if (this.checkFR) {
      this.recentFrames.splice(0, 1);
      this.recentFrames.push(performance.now());
      this.framerate = 1000 / (this.recentFrames[1] - this.recentFrames[0]);
    }
  }
  start() {
    this.protoFuncs();
    this.origin = this.vector.new();
    this.origin3 = this.vector3.new();
    this.off = this.vector.new();
    MIDDLE = this.vector.new(width / 2, height / 2);
    this.seed = this.random(this.M);
    this.recentRandom = this.random(this.M);
    this.noise.init();
    this.mouse = new _Mouse();
    this.addEventListeners();
    if (typeof Start === "function") Start();
    BackgroundDraw();
  }
  addEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.keysDown.includes(e.key)) {
        this.keysDown.push(e.key);
        this.keysPressed.push(e.key);
      }
    });
    document.addEventListener("keyup", (e) => {
      this.keysDown.splice(this.keysDown.indexOf(e.key), 1);
      this.keysReleased.push(e.key);
    });
  }
  protoFuncs() {
    Array.prototype.average = function () {
      let _avg = 0;
      for (let _num of this) _avg += _num;
      return _avg / this.length;
    };
    Array.prototype.copy = function () {
      let _newArr = [];
      for (let elem of this) _newArr.push(elem);
      return _newArr;
    };
    Array.prototype.random = function () {
      return this[dj.floor(dj.random(this.length))];
    }
    Object.prototype.copy = function () {
      let _copy = this.constructor();
      for (let attr in this)
        if (this.hasOwnProperty(attr)) _copy[attr] = this[attr];
      return _copy;
    };
    Object.prototype.toArray = function () {
      let _newArr = [];
      for (let attr in this)
        if (this.hasOwnProperty(attr)) _newArr.push(this[attr]);
      return _newArr;
    };
    // toVec()
  }
}

class ColorRGB {
  constructor(_r, _g = _r, _b = _r, _a = 255) {
    this.r = _r;
    this.g = _g;
    this.b = _b;
    this.a = _a;
  }
}
class ColorHSL {
  constructor(_h, _s, _l, _a = 255) {
    this.h = _h;
    this.s = _s;
    this.l = _l;
    this.a = _a;
  }

  toRGB() {
    const _h = this.h;
    const _s = this.s / 100;
    const _l = this.l / 100;
    const _a = _s * min(_l, 1 - l);
    const _f = (_n, _k = (_n + _h / 30) % 12) =>
      round((_l - _a * max(min(_k - 3, 9 - _k, 1), -1)) * 255);
    return [_f(0), _f(8), _f(4), _c[3]];
  }
}
class _Vector {
  constructor(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.r = dj.dist(0, 0, this.x, this.y);
    this.a = dj.atan(this.y, this.x);
  }
  add(_v) {
    this.x += _v.x;
    this.y += _v.y;
    this.r = dj.dist(0, 0, this.x, this.y);
    this.a = dj.atan(this.y, this.x);
    return this;
  }
  sub(_v) {
    this.x -= _v.x;
    this.y -= _v.y;
    this.r = dj.dist(0, 0, this.x, this.y);
    this.a = dj.atan(this.y, this.x);
    return this;
  }
  scl(_a) {
    this.x *= _a;
    this.y *= _a;
    this.r *= _a;
    return this;
  }
  div(_a) {
    this.x /= _a;
    this.y /= _a;
    this.r /= _a;
    return this;
  }
  norm() {
    if (this.r !== 0) {
      this.scl(1 / this.r);
      this.r = 1;
      return this;
    }
  }
  set() {
    let _x, _y;
    if (arguments.length == 0) {
      _x = _y = 0;
    } else if (arguments.length == 1) {
      _x = arguments[0].x;
      _y = arguments[0].y;
    } else if (arguments.length == 2) {
      _x = arguments[0];
      _y = arguments[1];
    }
    this.x = _x;
    this.y = _y;
    this.r = dj.dist(0, 0, this.x, this.y);
    this.a = dj.atan(this.y, this.x);
    return this;
  }
  setMag(_r) {
    this.scl(_r / this.r);
    return this;
  }
  limit(_mag) {
    if (this.r > _mag) this.setMag(_mag);
  }
  limitX = (_x) => dj.constrain(dj.abs(this.x), 0, _x);
  limitY = (_y) => dj.constrain(dj.abs(this.y), 0, _y);
  rotate(_a) {
    this.a += _a;
    this.x = this.r * dj.cos(this.a);
    this.y = this.r * dj.sin(this.a);
    return this;
  }
  align(_a) {
    this.a = _a;
    this.x = this.r * dj.cos(this.a);
    this.y = this.r * dj.sin(this.a);
    return this;
  }
  dot = (_v) => this.x * _v.x + this.y * _v.y;
  toMat = () => [[this.x], [this.y]];
  copy = () => dj.vector.new(this.x, this.y);
}
class _Vector3 {
  constructor(_x, _y, _z) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
  }
  // s. Vector2
  // project()
}
class _VectorMath {
  new = (_x = 0, _y = 0) => new _Vector(_x, _y);
  polar = (_r, _a) => new _Vector(_r * dj.cos(_a), _r * dj.sin(_a));
  add = (_v1, _v2) => this.new(_v1.x + _v2.x, _v1.y + _v2.y);
  sub = (_v1, _v2) => this.new(_v1.x - _v2.x, _v1.y - _v2.y);
  scl = (_v, _a) => this.new(_v.x * _a, _v.y * _a);
  div = (_v, _a) => (_a !== 0 ? this.new(_v.x / _a, _v.y / _a) : undefined);
  norm = (_v) => (_v.r !== 0 ? _v.copy().div(_v.r) : undefined);
  dot = (_v1, _v2) => _v1.x * _v2.x + _v1.y * _v2.y;
  toMat = (_v) => [[_v.x], [_v.y]];
  random() {
    const args = arguments;
    let _r, _a;

    if (args.length == 0) _r = 1;
    else if (args.length == 1) _r = dj.random() * args[0];
    else if (args.length == 2) _r = dj.random() * (args[1] - args[0]) + args[0];
    _a = dj.random() * 2 * PI;
    return this.polar(_r, _a);
  }
}
class _Vector3Math {
  new = (_x = 0, _y = 0, _z = 0) => new _Vector3(_x, _y, _z);
  // cross = (_v1, _v2) =>
  //   createVector3(
  //     _v1.y * _v2.z - _v1.z * _v2.y,
  //     _v1.z * _v2.x - _v1.x * _v2.z,
  //     _v1.x * _v2.y - _v1.y * _v2.x
  //   );
}
class _SimplexNoise {
  constructor() {
    this.grad3 = [
      [1, 1, 0],
      [-1, 1, 0],
      [1, -1, 0],
      [-1, -1, 0],
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [0, 1, 1],
      [0, -1, 1],
      [0, 1, -1],
      [0, -1, -1],
    ];
  }

  setSeed(s) {
    const before = dj.recentRandom;
    dj.setSeed(s);
    this.init();
    dj.setSeed(before);
  }

  init() {
    this.p = [];
    this.perm = new Array(512);
    for (let i = 0; i < 256; i++) {
      const val = Math.floor(dj.random(255));
      this.p[i] = this.perm[i] = this.perm[i + 256] = val;
    }
  }

  dot2 = (g, x, y) => g[0] * x + g[1] * y;
  dot3 = (g, x, y, z) => g[0] * x + g[1] * y + g[2] * z;

  eval() {
    if (arguments.length == 2) return this.eval2(arguments[0], arguments[1]);
    return this.eval3(arguments[0], arguments[1], arguments[2]);
  }

  eval2(xin, yin) {
    let n0, n1, n2;

    this.F2 = 0.5 * (Math.sqrt(3) - 1);
    this.G2 = (3 - Math.sqrt(3)) / 6;

    const s = (xin + yin) * this.F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * this.G2;

    const x0 = xin - i + t;
    const y0 = yin - j + t;

    const i1 = x0 > y0; // if x0>y0: i1 = 1, else i1 = 0
    const j1 = i1 == 0; // if x0>y0: j1 = 0, else j1 = 1

    const x1 = x0 - i1 + this.G2;
    const y1 = y0 - j1 + this.G2;

    const xy2 = -1 + 2 * this.G2;
    const x2 = x0 + xy2;
    const y2 = y0 + xy2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.perm[ii + this.perm[jj]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot2(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot2(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot2(this.grad3[gi2], x2, y2);
    }

    return 35 * (n0 + n1 + n2) + 0.5; // between 0 and 1
  }

  eval3(xin, yin, zin) {
    let n0, n1, n2, n3;

    this.F3 = 1 / 3;
    this.G3 = 1 / 6;

    const s = (xin + yin + zin) * this.F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * this.G3;

    const x0 = xin - i + t;
    const y0 = yin - j + t;
    const z0 = zin - k + t;

    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      j1 = 0;
      i2 = 1;
      if (y0 >= z0) {
        i1 = 1;
        k1 = 0;
        j2 = 1;
        k2 = 0;
      } // X Y Z
      else if (x0 >= z0) {
        i1 = 1;
        k1 = 0;
        j2 = 0;
        k2 = 1;
      } // X Z Y
      else {
        i1 = 0;
        k1 = 1;
        j2 = 0;
        k2 = 1;
      } // Z X Y
    } else {
      i1 = 0;
      j2 = 1;
      if (y0 < z0) {
        j1 = 0;
        k1 = 1;
        i2 = 0;
        k2 = 1;
      } // Z Y X
      else if (x0 < z0) {
        j1 = 1;
        k1 = 0;
        i2 = 0;
        k2 = 1;
      } // Y Z X
      else {
        j1 = 1;
        k1 = 0;
        i2 = 1;
        k2 = 0;
      } // Y X Z
    }
    const x1 = x0 - i1 + this.G3;
    const y1 = y0 - j1 + this.G3;
    const z1 = z0 - k1 + this.G3;

    const xyz2 = 2 * this.G3;
    const x2 = x0 - i2 + xyz2;
    const y2 = y0 - j2 + xyz2;
    const z2 = z0 - k2 + xyz2;

    const xyz3 = -1 + 3 * this.G3;
    const x3 = x0 + xyz3;
    const y3 = y0 + xyz3;
    const z3 = z0 + xyz3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
    const gi1 =
      this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
    const gi2 =
      this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
    const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3);
    }

    return 16 * (n0 + n1 + n2 + n3) + 0.5;
  }
}
class _Date {
  constructor() {
    this.update();
  }

  update() {
    const _Current = new Date();

    this.year = _Current.getFullYear();
    this.month = _Current.getMonth();
    this.day = _Current.getDate();
    this.weekday = _Current.getDay();
    this.hour = _Current.getHours();
    this.minute = _Current.getMinutes();
    this.seconds = _Current.getSeconds();
    this.millis = _Current.getMilliseconds();
    this.absMillis = _Current.getTime();

    return this;
  }
}
class _Mouse {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.pos = dj.vector.new(this.x, this.y);

    this.px = 0;
    this.py = 0;
    this.ppos = dj.vector.new(this.px, this.py);

    this.vel = dj.vector.sub(this.pos, this.ppos);

    this.down = false;
    this.click = false;
  }

  update(e) {
    this.px = this.x;
    this.py = this.y;
    this.ppos = this.pos;

    this.x = e.clientX - dj.canvasRect.x;
    this.y = e.clientY - dj.canvasRect.y;
    this.pos = dj.vector.new(this.x, this.y);

    this.vel = dj.vector.sub(this.ppos, this.pos);
  }
}

let width, height;
let MIDDLE;
let FILLING = true;
const PI = Math.PI;
const E = Math.E;
const FULL = "full";
const NONE = "none";
const RGB = "rgb";
const HSL = "hsl";
const HEX = "hex";
const CLICK = "click";

let dj;

function BackgroundStart() {
  dj = new DJ();
  dj.start();
  dj.canvasRect = dj.canvas.getBoundingClientRect();
}

function BackgroundDraw() {
  dj.checkRunning();
  if (typeof Draw === "function") {
    for (let i = 0; i < dj.running; i++) {
      Draw();
      dj.framecount++;
    }
  }
  dj.handleInput();
  if (dj.framecount % 60 === 0) dj.canvasRect = dj.canvas.getBoundingClientRect();
  dj.bgFramecount = requestAnimationFrame(BackgroundDraw);
}

window.addEventListener("load", BackgroundStart);

// Ü, ü     \u00dc, \u00fc
// Ä, ä     \u00c4, \u00e4
// Ö, ö     \u00d6, \u00f6
// ß        \u00df

// --- shortcuts: ---
// console.log(): cl, alt + m
// ${}: v, alt + n
// for-loop: fl, alt + i
// strokeWeight(): sw
// class template: cc, alt + k
// set selection achor: alt + s
// select achor-cursor: alt + d
