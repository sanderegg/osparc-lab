qx.Class.define("qxapp.modeler.splineCreator", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
  },

  members : {
    _threeView: null,
    _pointList: [],
    _controlPoints: [],
    _spline_temp: null,

    StartTool : function()
    {
      const fixed_axe = 2;
      const fixed_pos = 0;
      this._threeView.AddInvisiblePlane(fixed_axe, fixed_pos);
      this._pointList = [];
      this._controlPoints = [];
    },

    StopTool : function()
    {
      this._threeView.RemoveInvisiblePlane();
    },

    OnMouseHover : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];
        var hoverPointList = this._pointList.concat([intersect.point]);
        if (hoverPointList.length>1)
        {
          this._threeView._threeWrapper.RemoveFromScene(this._spline_temp);
          this._spline_temp = this._threeView._threeWrapper.CreateSpline(hoverPointList);
          this._threeView._threeWrapper.AddEntityToScene(this._spline_temp);
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

        if (this._pointList.length>1)
        {
          if (event.button === 0)
          {
            this._threeView._threeWrapper.RemoveFromScene(this._spline_temp);
            this._spline_temp = this._threeView._threeWrapper.CreateSpline(this._pointList);
            this._threeView._threeWrapper.AddEntityToScene(this._spline_temp);
          }
          else if (event.button === 2)
          {
            this._consolidateSpline();
          }
        }
      }

      return true;
    },

    _consolidateSpline : function()
    {
      if (this._spline_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._spline_temp);
        this._spline_temp = null;
        for (var i = 0; i < this._controlPoints.length; i++) {
          this._threeView._threeWrapper.RemoveFromScene(this._controlPoints[i]);
        }
      }

      var spline = this._threeView._threeWrapper.CreateSpline(this._pointList);
      spline.name = "Spline";
      for (var i = 0; i < this._controlPoints.length; i++) {
        spline.add(this._controlPoints[i]);
      }
      this._threeView.AddEntityToScene(spline);
      this._pointList = [];
      this._controlPoints = [];
      this._threeView.StopTool();
    },
  },
});
