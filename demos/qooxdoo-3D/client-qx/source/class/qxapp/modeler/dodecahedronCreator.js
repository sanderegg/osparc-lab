qx.Class.define("qxapp.modeler.dodecahedronCreator", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
  },

  members : {
    _threeView: null,
    _steps: { centerPoint: 0, radius: 1 },
    _nextStep: 0,
    _centerPoint: null,
    _radius: null,
    _dodecahedron_material: null,
    _dodecahedron_temp: null,

    StartTool : function()
    {
      const fixed_axe = 2;
      const fixed_pos = 0;
      this._threeView.AddInvisiblePlane(fixed_axe, fixed_pos);
    },

    StopTool : function()
    {
      this._threeView.RemoveInvisiblePlane();
    },

    OnMouseHover : function(event, intersects)
    {
      if (intersects.length > 0 && this._nextStep === this._steps.radius)
      {
        var intersect = intersects[0];
        var temp_radius = Math.hypot(intersect.point.x-this._centerPoint.x, intersect.point.y-this._centerPoint.y);
        if (this._dodecahedron_temp) {
          this._threeView._threeWrapper.RemoveFromScene(this._dodecahedron_temp);
        }
        var dodecahedronGeometry = this._threeView._threeWrapper.CreateDodecahedron(temp_radius);
        if (this._dodecahedron_material === null) {
          this._dodecahedron_material = this._threeView._threeWrapper.CreateNewMaterial();
        }
        this._dodecahedron_temp = this._threeView._threeWrapper.CreateEntity(dodecahedronGeometry, this._dodecahedron_material);

        this._updatePostion(this._dodecahedron_temp, this._centerPoint);

        this._threeView._threeWrapper.AddEntityToScene(this._dodecahedron_temp);
      }

      return true;
    },

    OnMouseDown : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];

        if (this._centerPoint === null) {
          this._centerPoint = intersect.point;
          this._nextStep = this._steps.radius;
          return true;
        }

        if (this._radius === null) {
          this._radius = Math.hypot(intersect.point.x-this._centerPoint.x, intersect.point.y-this._centerPoint.y);
          this._consolidateDodecahedron();
          return true;
        }
      }

      return true;
    },

    _updatePostion : function(mesh, center)
    {
      mesh.position.x = center.x;
      mesh.position.y = center.y;
      mesh.position.z = center.z;
    },

    _consolidateDodecahedron : function()
    {
      if (this._dodecahedron_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._dodecahedron_temp);
        this._dodecahedron_temp = null;
      }

      var geometry = this._threeView._threeWrapper.CreateDodecahedron(this._radius);
      if (this._dodecahedron_material === null) {
        this._dodecahedron_material = this._threeView._threeWrapper.CreateNewMaterial();
      }
      var entity = this._threeView._threeWrapper.CreateEntity(geometry, this._dodecahedron_material);
      entity.name = "Dodecahedron";

      this._updatePostion(entity, this._centerPoint);

      this._threeView.AddEntityToScene(entity);
      this._threeView.StopTool();
    },
  },
});
