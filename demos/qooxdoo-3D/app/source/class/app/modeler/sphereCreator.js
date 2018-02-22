qx.Class.define("app.modeler.sphereCreator", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeViewer = threeViewer;
  },

  events : {
    "newSphereS4LRequested": "qx.event.type.Data",
  },

  members : {
    _threeViewer: null,
    _steps: { centerPoint: 0, radius: 1 },
    _nextStep: 0,
    _centerPoint: null,
    _radius: null,
    _sphere_temp: null,

    StartTool : function()
    {
      const fixed_axe = 2;
      const fixed_pos = 0;
      this._threeViewer.AddInvisiblePlane(fixed_axe, fixed_pos);
    },

    StopTool : function()
    {
      this._threeViewer.RemoveInvisiblePlane();
    },

    OnMouseHover : function(event, intersects)
    {
      if (intersects.length > 0 && this._nextStep === this._steps.radius)
      {
        var intersect = intersects[0];
        var temp_radius = Math.hypot(intersect.point.x-this._centerPoint.x, intersect.point.y-this._centerPoint.y);
        if (this._sphere_temp) {
          this._threeViewer._threeWrapper.RemoveFromScene(this._sphere_temp);
        }
        var geometry = this._threeViewer._threeWrapper.CreateSphere(temp_radius, this._centerPoint.x, this._centerPoint.y, this._centerPoint.z );
        var material = this._threeViewer._threeWrapper.CreateNewMaterial();
        this._sphere_temp = this._threeViewer._threeWrapper.CreateEntity(geometry, material);
        this._threeViewer._threeWrapper.AddEntityToScene(this._sphere_temp);
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
          this._consolidateSphere();
          return true;
        }
      }

      return true;
    },

    _consolidateSphere : function()
    {
      this.fireDataEvent("newSphereS4LRequested", this._pointList);
      var geometry = this._threeViewer._threeWrapper.CreateSphere(this._radius, this._centerPoint.x, this._centerPoint.y, this._centerPoint.z );
      var material = this._threeViewer._threeWrapper.CreateNewMaterial();
      var entity = this._threeViewer._threeWrapper.CreateEntity(geometry, material);
      entity.name = "Sphere";
      this._threeViewer.AddEntityToScene(entity);
      this._pointList = [];
      this._threeViewer.StopTool();
    },
  },
});
