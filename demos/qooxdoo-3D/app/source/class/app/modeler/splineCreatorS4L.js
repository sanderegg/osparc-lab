qx.Class.define("app.modeler.splineCreatorS4L", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
  },

  events : {
    "newSplineS4LRequested": "qx.event.type.Data",
  },

  members : {
    _threeView: null,
    _pointList: [],
    _controlPoints: [],
    _spline_temp: null,
    _uuid_temp: '',

    StartTool : function()
    {
      const fixed_axe = 2;
      const fixed_pos = 0;
      this._threeView.AddInvisiblePlane(fixed_axe, fixed_pos);
      this._pointList = [];
      this._controlPoints = [];
      this._spline_temp = null;
      this._uuid_temp = '';
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
        if (intersects.length > 0)
        {
          var intersect = intersects[0];
          var hoverPointList = this._pointList.concat([intersect.point]);
          if (hoverPointList.length>1) {
            this.fireDataEvent("newSplineS4LRequested", [hoverPointList, this._uuid_temp]);
          }
        }
      }
      return true;
    },

    OnMouseDown : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];
        this._pointList.push(intersect.point);

        var control_point = this._threeView._threeWrapper.CreatePoint(intersect.point);
        this._threeView._threeWrapper.AddEntityToScene(control_point);
        this._controlPoints.push(control_point);

        if (this._pointList.length === 1) {
          var dummy_point = JSON.parse(JSON.stringify(this._pointList[0]));
          dummy_point.x = dummy_point.x * 1.00001;
          var temp_list = [this._pointList[0], dummy_point];
          this.fireDataEvent("newSplineS4LRequested", [temp_list, this._uuid_temp]);
        }

        if (this._pointList.length>1)
        {
          if (event.button === 0) {
            this.fireDataEvent("newSplineS4LRequested", [this._pointList, this._uuid_temp]);
          } else if (event.button === 2) {
            this.fireDataEvent("newSplineS4LRequested", [this._pointList, '']);
          }
        }
      }

      return true;
    },

    SplineFromS4L : function(response)
    {
      var spline = this._threeView._threeWrapper.CreateSpline(response.value);
      spline.name = "Spline_S4L";
      spline.uuid = response.uuid;

      if (this._uuid_temp === '') {
        this._uuid_temp = spline.uuid;
      }

      if (this._spline_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._spline_temp);
      }

      if (this._uuid_temp === spline.uuid) {
        this._spline_temp = spline;
        this._threeView._threeWrapper.AddEntityToScene(this._spline_temp);
      } else {
        this._consolidateSpline(spline);
      }
    },

    _consolidateSpline : function(spline)
    {
      spline.name = "Spline_S4L";

      for (var i = 0; i < this._controlPoints.length; i++) {
        this._threeView._threeWrapper.RemoveFromScene(this._controlPoints[i]);
        spline.add(this._controlPoints[i]);
      }
      this._threeView.AddEntityToScene(spline);
      //this._spline_temp = null;
      this._uuid_temp = '';
      this._pointList = [];
      this._controlPoints = [];
      this._threeView.StopTool();
    },
  },
});
