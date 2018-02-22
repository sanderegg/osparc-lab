//
// Autogenerated by Thrift Compiler (0.11.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
"use strict";

var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;


var ttypes = module.exports = {};
var Entity = module.exports.Entity = function(args) {
  this.name = null;
  this.uuid = null;
  this.children = null;
  this.has_geometry = true;
  if (args) {
    if (args.name !== undefined && args.name !== null) {
      this.name = args.name;
    }
    if (args.uuid !== undefined && args.uuid !== null) {
      this.uuid = args.uuid;
    }
    if (args.children !== undefined && args.children !== null) {
      this.children = Thrift.copyList(args.children, [null]);
    }
    if (args.has_geometry !== undefined && args.has_geometry !== null) {
      this.has_geometry = args.has_geometry;
    }
  }
};
Entity.prototype = {};
Entity.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.name = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.uuid = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.LIST) {
        var _size0 = 0;
        var _rtmp34;
        this.children = [];
        var _etype3 = 0;
        _rtmp34 = input.readListBegin();
        _etype3 = _rtmp34.etype;
        _size0 = _rtmp34.size;
        for (var _i5 = 0; _i5 < _size0; ++_i5)
        {
          var elem6 = null;
          elem6 = new ttypes.Entity();
          elem6.read(input);
          this.children.push(elem6);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.BOOL) {
        this.has_geometry = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Entity.prototype.write = function(output) {
  output.writeStructBegin('Entity');
  if (this.name !== null && this.name !== undefined) {
    output.writeFieldBegin('name', Thrift.Type.STRING, 1);
    output.writeString(this.name);
    output.writeFieldEnd();
  }
  if (this.uuid !== null && this.uuid !== undefined) {
    output.writeFieldBegin('uuid', Thrift.Type.STRING, 2);
    output.writeString(this.uuid);
    output.writeFieldEnd();
  }
  if (this.children !== null && this.children !== undefined) {
    output.writeFieldBegin('children', Thrift.Type.LIST, 3);
    output.writeListBegin(Thrift.Type.STRUCT, this.children.length);
    for (var iter7 in this.children)
    {
      if (this.children.hasOwnProperty(iter7))
      {
        iter7 = this.children[iter7];
        iter7.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.has_geometry !== null && this.has_geometry !== undefined) {
    output.writeFieldBegin('has_geometry', Thrift.Type.BOOL, 4);
    output.writeBool(this.has_geometry);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var Color = module.exports.Color = function(args) {
  this.r = null;
  this.g = null;
  this.b = null;
  this.a = 1;
  if (args) {
    if (args.r !== undefined && args.r !== null) {
      this.r = args.r;
    }
    if (args.g !== undefined && args.g !== null) {
      this.g = args.g;
    }
    if (args.b !== undefined && args.b !== null) {
      this.b = args.b;
    }
    if (args.a !== undefined && args.a !== null) {
      this.a = args.a;
    }
  }
};
Color.prototype = {};
Color.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.DOUBLE) {
        this.r = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.DOUBLE) {
        this.g = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.b = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.DOUBLE) {
        this.a = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Color.prototype.write = function(output) {
  output.writeStructBegin('Color');
  if (this.r !== null && this.r !== undefined) {
    output.writeFieldBegin('r', Thrift.Type.DOUBLE, 1);
    output.writeDouble(this.r);
    output.writeFieldEnd();
  }
  if (this.g !== null && this.g !== undefined) {
    output.writeFieldBegin('g', Thrift.Type.DOUBLE, 2);
    output.writeDouble(this.g);
    output.writeFieldEnd();
  }
  if (this.b !== null && this.b !== undefined) {
    output.writeFieldBegin('b', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.b);
    output.writeFieldEnd();
  }
  if (this.a !== null && this.a !== undefined) {
    output.writeFieldBegin('a', Thrift.Type.DOUBLE, 4);
    output.writeDouble(this.a);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var Material = module.exports.Material = function(args) {
  this.diffuse = null;
  if (args) {
    if (args.diffuse !== undefined && args.diffuse !== null) {
      this.diffuse = new ttypes.Color(args.diffuse);
    }
  }
};
Material.prototype = {};
Material.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRUCT) {
        this.diffuse = new ttypes.Color();
        this.diffuse.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Material.prototype.write = function(output) {
  output.writeStructBegin('Material');
  if (this.diffuse !== null && this.diffuse !== undefined) {
    output.writeFieldBegin('diffuse', Thrift.Type.STRUCT, 1);
    this.diffuse.write(output);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var Vertex = module.exports.Vertex = function(args) {
  this.x = null;
  this.y = null;
  this.z = null;
  if (args) {
    if (args.x !== undefined && args.x !== null) {
      this.x = args.x;
    }
    if (args.y !== undefined && args.y !== null) {
      this.y = args.y;
    }
    if (args.z !== undefined && args.z !== null) {
      this.z = args.z;
    }
  }
};
Vertex.prototype = {};
Vertex.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.DOUBLE) {
        this.x = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.DOUBLE) {
        this.y = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.z = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Vertex.prototype.write = function(output) {
  output.writeStructBegin('Vertex');
  if (this.x !== null && this.x !== undefined) {
    output.writeFieldBegin('x', Thrift.Type.DOUBLE, 1);
    output.writeDouble(this.x);
    output.writeFieldEnd();
  }
  if (this.y !== null && this.y !== undefined) {
    output.writeFieldBegin('y', Thrift.Type.DOUBLE, 2);
    output.writeDouble(this.y);
    output.writeFieldEnd();
  }
  if (this.z !== null && this.z !== undefined) {
    output.writeFieldBegin('z', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.z);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var Vector = module.exports.Vector = function(args) {
  this.x = null;
  this.y = null;
  this.z = null;
  if (args) {
    if (args.x !== undefined && args.x !== null) {
      this.x = args.x;
    }
    if (args.y !== undefined && args.y !== null) {
      this.y = args.y;
    }
    if (args.z !== undefined && args.z !== null) {
      this.z = args.z;
    }
  }
};
Vector.prototype = {};
Vector.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.DOUBLE) {
        this.x = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.DOUBLE) {
        this.y = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.z = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Vector.prototype.write = function(output) {
  output.writeStructBegin('Vector');
  if (this.x !== null && this.x !== undefined) {
    output.writeFieldBegin('x', Thrift.Type.DOUBLE, 1);
    output.writeDouble(this.x);
    output.writeFieldEnd();
  }
  if (this.y !== null && this.y !== undefined) {
    output.writeFieldBegin('y', Thrift.Type.DOUBLE, 2);
    output.writeDouble(this.y);
    output.writeFieldEnd();
  }
  if (this.z !== null && this.z !== undefined) {
    output.writeFieldBegin('z', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.z);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var EntityMesh = module.exports.EntityMesh = function(args) {
  this.vertices = null;
  this.normals = null;
  this.triangles = null;
  this.transform4x4 = null;
  this.material = null;
  this.lines = null;
  this.points = null;
  if (args) {
    if (args.vertices !== undefined && args.vertices !== null) {
      this.vertices = Thrift.copyList(args.vertices, [null]);
    }
    if (args.normals !== undefined && args.normals !== null) {
      this.normals = Thrift.copyList(args.normals, [null]);
    }
    if (args.triangles !== undefined && args.triangles !== null) {
      this.triangles = Thrift.copyList(args.triangles, [null]);
    }
    if (args.transform4x4 !== undefined && args.transform4x4 !== null) {
      this.transform4x4 = Thrift.copyList(args.transform4x4, [null]);
    }
    if (args.material !== undefined && args.material !== null) {
      this.material = new ttypes.Material(args.material);
    }
    if (args.lines !== undefined && args.lines !== null) {
      this.lines = Thrift.copyList(args.lines, [null]);
    }
    if (args.points !== undefined && args.points !== null) {
      this.points = Thrift.copyList(args.points, [null]);
    }
  }
};
EntityMesh.prototype = {};
EntityMesh.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.LIST) {
        var _size8 = 0;
        var _rtmp312;
        this.vertices = [];
        var _etype11 = 0;
        _rtmp312 = input.readListBegin();
        _etype11 = _rtmp312.etype;
        _size8 = _rtmp312.size;
        for (var _i13 = 0; _i13 < _size8; ++_i13)
        {
          var elem14 = null;
          elem14 = input.readDouble();
          this.vertices.push(elem14);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        var _size15 = 0;
        var _rtmp319;
        this.normals = [];
        var _etype18 = 0;
        _rtmp319 = input.readListBegin();
        _etype18 = _rtmp319.etype;
        _size15 = _rtmp319.size;
        for (var _i20 = 0; _i20 < _size15; ++_i20)
        {
          var elem21 = null;
          elem21 = input.readDouble();
          this.normals.push(elem21);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.LIST) {
        var _size22 = 0;
        var _rtmp326;
        this.triangles = [];
        var _etype25 = 0;
        _rtmp326 = input.readListBegin();
        _etype25 = _rtmp326.etype;
        _size22 = _rtmp326.size;
        for (var _i27 = 0; _i27 < _size22; ++_i27)
        {
          var elem28 = null;
          elem28 = input.readI32();
          this.triangles.push(elem28);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.LIST) {
        var _size29 = 0;
        var _rtmp333;
        this.transform4x4 = [];
        var _etype32 = 0;
        _rtmp333 = input.readListBegin();
        _etype32 = _rtmp333.etype;
        _size29 = _rtmp333.size;
        for (var _i34 = 0; _i34 < _size29; ++_i34)
        {
          var elem35 = null;
          elem35 = input.readDouble();
          this.transform4x4.push(elem35);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.STRUCT) {
        this.material = new ttypes.Material();
        this.material.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.LIST) {
        var _size36 = 0;
        var _rtmp340;
        this.lines = [];
        var _etype39 = 0;
        _rtmp340 = input.readListBegin();
        _etype39 = _rtmp340.etype;
        _size36 = _rtmp340.size;
        for (var _i41 = 0; _i41 < _size36; ++_i41)
        {
          var elem42 = null;
          elem42 = input.readI32();
          this.lines.push(elem42);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 7:
      if (ftype == Thrift.Type.LIST) {
        var _size43 = 0;
        var _rtmp347;
        this.points = [];
        var _etype46 = 0;
        _rtmp347 = input.readListBegin();
        _etype46 = _rtmp347.etype;
        _size43 = _rtmp347.size;
        for (var _i48 = 0; _i48 < _size43; ++_i48)
        {
          var elem49 = null;
          elem49 = input.readI32();
          this.points.push(elem49);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

EntityMesh.prototype.write = function(output) {
  output.writeStructBegin('EntityMesh');
  if (this.vertices !== null && this.vertices !== undefined) {
    output.writeFieldBegin('vertices', Thrift.Type.LIST, 1);
    output.writeListBegin(Thrift.Type.DOUBLE, this.vertices.length);
    for (var iter50 in this.vertices)
    {
      if (this.vertices.hasOwnProperty(iter50))
      {
        iter50 = this.vertices[iter50];
        output.writeDouble(iter50);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.normals !== null && this.normals !== undefined) {
    output.writeFieldBegin('normals', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.DOUBLE, this.normals.length);
    for (var iter51 in this.normals)
    {
      if (this.normals.hasOwnProperty(iter51))
      {
        iter51 = this.normals[iter51];
        output.writeDouble(iter51);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.triangles !== null && this.triangles !== undefined) {
    output.writeFieldBegin('triangles', Thrift.Type.LIST, 3);
    output.writeListBegin(Thrift.Type.I32, this.triangles.length);
    for (var iter52 in this.triangles)
    {
      if (this.triangles.hasOwnProperty(iter52))
      {
        iter52 = this.triangles[iter52];
        output.writeI32(iter52);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.transform4x4 !== null && this.transform4x4 !== undefined) {
    output.writeFieldBegin('transform4x4', Thrift.Type.LIST, 4);
    output.writeListBegin(Thrift.Type.DOUBLE, this.transform4x4.length);
    for (var iter53 in this.transform4x4)
    {
      if (this.transform4x4.hasOwnProperty(iter53))
      {
        iter53 = this.transform4x4[iter53];
        output.writeDouble(iter53);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.material !== null && this.material !== undefined) {
    output.writeFieldBegin('material', Thrift.Type.STRUCT, 5);
    this.material.write(output);
    output.writeFieldEnd();
  }
  if (this.lines !== null && this.lines !== undefined) {
    output.writeFieldBegin('lines', Thrift.Type.LIST, 6);
    output.writeListBegin(Thrift.Type.I32, this.lines.length);
    for (var iter54 in this.lines)
    {
      if (this.lines.hasOwnProperty(iter54))
      {
        iter54 = this.lines[iter54];
        output.writeI32(iter54);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.points !== null && this.points !== undefined) {
    output.writeFieldBegin('points', Thrift.Type.LIST, 7);
    output.writeListBegin(Thrift.Type.I32, this.points.length);
    for (var iter55 in this.points)
    {
      if (this.points.hasOwnProperty(iter55))
      {
        iter55 = this.points[iter55];
        output.writeI32(iter55);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var EntityLine = module.exports.EntityLine = function(args) {
  console.log('EntityLine_args:', args);
  this.vertices = null;
  this.transform4x4 = null;
  this.material = null;
  if (args) {
    if (args.vertices !== undefined && args.vertices !== null) {
      this.vertices = Thrift.copyList(args.vertices, [ttypes.Vertex]);
      console.log('EntityLine_verices_this:', this.vertices);
    }
    if (args.transform4x4 !== undefined && args.transform4x4 !== null) {
      this.transform4x4 = Thrift.copyList(args.transform4x4, [null]);
      console.log('EntityLine_transform4x4_this:', this.transform4x4);
    }
    if (args.material !== undefined && args.material !== null) {
      this.material = new ttypes.Material(args.material);
    }
  }
};
EntityLine.prototype = {};
EntityLine.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.LIST) {
        var _size56 = 0;
        var _rtmp360;
        this.vertices = [];
        var _etype59 = 0;
        _rtmp360 = input.readListBegin();
        _etype59 = _rtmp360.etype;
        _size56 = _rtmp360.size;
        for (var _i61 = 0; _i61 < _size56; ++_i61)
        {
          var elem62 = null;
          elem62 = new ttypes.Vertex();
          elem62.read(input);
          this.vertices.push(elem62);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        var _size63 = 0;
        var _rtmp367;
        this.transform4x4 = [];
        var _etype66 = 0;
        _rtmp367 = input.readListBegin();
        _etype66 = _rtmp367.etype;
        _size63 = _rtmp367.size;
        for (var _i68 = 0; _i68 < _size63; ++_i68)
        {
          var elem69 = null;
          elem69 = input.readDouble();
          this.transform4x4.push(elem69);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.STRUCT) {
        this.material = new ttypes.Material();
        this.material.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

EntityLine.prototype.write = function(output) {
  output.writeStructBegin('EntityLine');
  if (this.vertices !== null && this.vertices !== undefined) {
    output.writeFieldBegin('vertices', Thrift.Type.LIST, 1);
    output.writeListBegin(Thrift.Type.STRUCT, this.vertices.length);
    for (var iter70 in this.vertices)
    {
      if (this.vertices.hasOwnProperty(iter70))
      {
        iter70 = this.vertices[iter70];
        iter70.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.transform4x4 !== null && this.transform4x4 !== undefined) {
    output.writeFieldBegin('transform4x4', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.DOUBLE, this.transform4x4.length);
    for (var iter71 in this.transform4x4)
    {
      if (this.transform4x4.hasOwnProperty(iter71))
      {
        iter71 = this.transform4x4[iter71];
        output.writeDouble(iter71);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.material !== null && this.material !== undefined) {
    output.writeFieldBegin('material', Thrift.Type.STRUCT, 3);
    this.material.write(output);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};
