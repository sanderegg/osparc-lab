qx.Class.define("app.modeler.cylinderCreator", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
  },

  members : {
    _threeView: null,
    _steps: { center: 0, radius: 1, height: 2 },
    _nextStep: 0,
    _centerPos: null,
    _radius: null,
    _height: null,
    _plane_material: null,
    _circle_temp: null,
    _cylinder_material: null,
    _cylinder_temp: null,

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

    _removeTemps : function()
    {
      if (this._circle_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._circle_temp);
      }
      if (this._cylinder_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._cylinder_temp);
      }
    },

    OnMouseHover : function(event, intersects)
    {
      if (intersects.length > 0 )
      {
        var intersect = intersects[0];
        if (this._nextStep === this._steps.radius)
        {
          this._removeTemps();

          var temp_radius = Math.hypot(intersect.point.x-this._centerPos.x, intersect.point.y-this._centerPos.y);
          var circleGeometry = this._threeView._threeWrapper.CreateCylinder( temp_radius );
          if (this._plane_material === null) {
            this._plane_material = this._threeView._threeWrapper.CreateNewPlaneMaterial();
          }
          this._circle_temp = this._threeView._threeWrapper.CreateEntity(circleGeometry, this._plane_material);

          this._updatePosition(this._circle_temp, this._centerPos);

          this._threeView._threeWrapper.AddEntityToScene(this._circle_temp);
        }
        else if (this._nextStep === this._steps.height)
        {
          this._removeTemps();

          var temp_height = intersect.point.z - this._centerPos.z;
          var cylinderGeometry = this._threeView._threeWrapper.CreateCylinder( this._radius, temp_height );
          if (this._cylinder_material === null) {
            this._cylinder_material = this._threeView._threeWrapper.CreateNewMaterial(this._plane_material.color.r, this._plane_material.color.g, this._plane_material.color.b);
          }
          this._cylinder_temp = this._threeView._threeWrapper.CreateEntity(cylinderGeometry, this._cylinder_material);

          this._updatePosition(this._cylinder_temp, this._centerPos, temp_height);

          this._threeView._threeWrapper.AddEntityToScene(this._cylinder_temp);
        }
      }
      return true;
    },

    OnMouseDown : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];

        if (this._centerPos === null) {
          this._centerPos = intersect.point;
          this._nextStep = this._steps.radius;
        }
        else if (this._radius === null)
        {
          this._radius = Math.hypot(intersect.point.x-this._centerPos.x, intersect.point.y-this._centerPos.y);
          this._nextStep = this._steps.height;
          this._threeView.RemoveInvisiblePlane();
          this._threeView.AddInvisiblePlane(0, this._centerPos.x);
        }
        else if (this._height === null)
        {
          this._height = intersect.point.z - this._centerPos.z;
          this._consolidateCylinder();
          this._nextStep = 3;
        }
      }

      return true;
    },

    _updatePosition(mesh, center, height)
    {
      if (height === undefined) {
        mesh.position.x = center.x;
        mesh.position.y = center.y;
        mesh.position.z = center.z;
      } else {
        //geometry.rotateX( Math.PI / 2 );
        //geometry.translate(center.x, center.y, height/2);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.x = center.x;
        mesh.position.y = center.y;
        mesh.position.z = height/2;
      }
    },

    _consolidateCylinder : function()
    {
      this._removeTemps();
      if (this._circle_temp) {
        this._circle_temp = null;
      }
      if (this._cylinder_temp) {
        this._cylinder_temp = null;
      }

      var geometry = this._threeView._threeWrapper.CreateCylinder( this._radius, this._height );
      if (this._cylinder_material === null) {
        this._cylinder_material = this._threeView._threeWrapper.CreateNewMaterial();
      }
      var entity = this._threeView._threeWrapper.CreateEntity(geometry, this._cylinder_material);
      entity.name = "Cylinder";

      this._updatePosition(entity, this._centerPos, this._height);

      this._threeView.AddEntityToScene(entity);
      this._threeView.StopTool();
    },
  },
});
