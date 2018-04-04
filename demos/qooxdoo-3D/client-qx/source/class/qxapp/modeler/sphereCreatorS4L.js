qx.Class.define("qxapp.modeler.sphereCreatorS4L", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
    this._my_uuid = this.uuidv4();
    console.log('new id', this._my_uuid);
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
    _my_uuid: '',

    uuidv4 : function ()
    {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

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
          this._uuid_temp = this.uuidv4();
          this.fireDataEvent("newSphereS4LRequested", [dummyRadius, this._centerPoint, this._uuid_temp]);
          return true;
        }

        if (this._radius === null) {
          this._radius = Math.hypot(intersect.point.x-this._centerPoint.x, intersect.point.y-this._centerPoint.y);
          this.fireDataEvent("newSphereS4LRequested", [this._radius, this._centerPoint, this._my_uuid]);
          return true;
        }
      }

      return true;
    },

    SphereFromS4L : function(response)
    {
      var sphereGeometry = this._threeView._threeWrapper.FromEntityMeshToEntity(response.value[0]);
      //var sphereMaterial = this._threeView._threeWrapper.CreateMeshNormalMaterial();
      var color = response.value[0].material.diffuse;
      var sphereMaterial = this._threeView._threeWrapper.CreateNewMaterial(color.r, color.g, color.b);
      var sphere = this._threeView._threeWrapper.CreateEntity(sphereGeometry, sphereMaterial);

      this._threeView._threeWrapper.ApplyTransformationMatrixToEntity(sphere, response.value[0].transform4x4)

      sphere.name = "Sphere_S4L";
      sphere.uuid = response.uuid;

      //console.log('temp', this._uuid_temp);
      //console.log('defi', this._my_uuid);
      //console.log('spId', sphere.uuid);

      //if (this._uuid_temp === '') {
      //  this._uuid_temp = sphere.uuid;
      //}

      if (this._sphere_temp) {
        this._threeView._threeWrapper.RemoveEntityFromScene(this._sphere_temp);
      }

      if (this._my_uuid === sphere.uuid) {
        this._consolidateSphere(sphere);
      } else {
        this._sphere_temp = sphere;
        this._threeView._threeWrapper.AddEntityToScene(this._sphere_temp);
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
