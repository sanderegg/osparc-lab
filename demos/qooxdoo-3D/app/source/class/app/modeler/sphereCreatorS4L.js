qx.Class.define("app.modeler.sphereCreatorS4L", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
  },

  events : {
    "newSphereS4LRequested": "qx.event.type.Data",
  },

  members : {
    _threeView: null,
    _steps: { centerPoint: 0, radius: 1 },
    _nextStep: 0,
    _centerPoint: null,
    _radius: null,
    _sphere_material: null,
    _sphere_temp: null,
    _uuid_temp: '',

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
      if (this._uuid_temp === '') {
        return;
      } else {
        if (intersects.length > 0 && this._nextStep === this._steps.radius)
        {
          var intersect = intersects[0];
          var temp_radius = Math.hypot(intersect.point.x-this._centerPoint.x, intersect.point.y-this._centerPoint.y);
          this.fireDataEvent("newSphereS4LRequested", [temp_radius, this._centerPoint, this._uuid_temp]);
          /*
          if (this._sphere_temp) {
            this._threeView._threeWrapper.RemoveFromScene(this._sphere_temp);
          }
          var sphereGeometry = this._threeView._threeWrapper.CreateSphere(temp_radius, this._centerPoint.x, this._centerPoint.y, this._centerPoint.z );
          if (this._sphere_material === null) {
            this._sphere_material = this._threeView._threeWrapper.CreateNewMaterial();
          }
          this._sphere_temp = this._threeView._threeWrapper.CreateEntity(sphereGeometry, this._sphere_material);
          this._threeView._threeWrapper.AddEntityToScene(this._sphere_temp);
          */
        }
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
          var dummyRadius = 0.0001;
          this.fireDataEvent("newSphereS4LRequested", [dummyRadius, this._centerPoint, '']);
          return true;
        }

        if (this._radius === null) {
          this._radius = Math.hypot(intersect.point.x-this._centerPoint.x, intersect.point.y-this._centerPoint.y);
          this.fireDataEvent("newSphereS4LRequested", [this._radius, this._centerPoint, '']);
          return true;
        }
      }

      return true;
    },

    SphereFromS4L : function(response)
    {
      var sphereGeometry = this._threeView._threeWrapper.CreateGeometryFromS4L(response.value[0]);
      var sphereMaterial = this._threeView._threeWrapper.CreateMeshNormalMaterial();
      var sphere = this._threeView._threeWrapper.CreateEntity(sphereGeometry, sphereMaterial);

      this._threeView._threeWrapper.ApplyTransformationMatrixToEntity(sphere, response.value[0].transform4x4)

      sphere.name = "Sphere_S4L";
      sphere.uuid = response.uuid;


      if (this._uuid_temp === '') {
        this._uuid_temp = sphere.uuid;
      }

      if (this._sphere_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._sphere_temp);
      }

      if (this._uuid_temp === sphere.uuid) {
        this._sphere_temp = sphere;
        this._threeView._threeWrapper.AddEntityToScene(this._sphere_temp);
      } else {
        this._consolidateSphere(sphere);
      }
    },

    _consolidateSphere : function(sphere)
    {
      sphere.name = "Sphere_S4L";
      this._threeView.AddEntityToScene(sphere);
      this._uuid_temp = '';
      this._threeView.StopTool();
    },
  },
});
