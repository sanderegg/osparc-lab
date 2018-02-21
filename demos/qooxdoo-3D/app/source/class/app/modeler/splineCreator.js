qx.Class.define("app.modeler.splineCreator", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeViewer = threeViewer;
  },

  members : {
    _threeViewer: null,
    _pointList: [],
    _spline_temp: null,

    StartTool : function()
    {
      this._threeViewer.AddInvisiblePlane();
    },

    StopTool : function()
    {
      this._threeViewer.RemoveInvisiblePlane();
    },

    OnMouseHover : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];
        var hoverPointList = this._pointList.concat([[intersect.point.x, intersect.point.y, intersect.point.z]]);
        if (hoverPointList.length>1)
        {
          this._threeViewer._threeWrapper.RemoveFromScene(this._spline_temp);
          this._spline_temp = this._threeViewer._threeWrapper.CreateSpline(hoverPointList);
          this._threeViewer._threeWrapper.AddEntityToScene(this._spline_temp);
        }
      }

      return true;
    },

    OnMouseDown : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];
        this._pointList.push([intersect.point.x, intersect.point.y, intersect.point.z]);

        if (this._pointList.length>1)
        {
          this._threeViewer._threeWrapper.RemoveFromScene(this._spline_temp);
          if (event.button === 0)
          {
            this._spline_temp = this._threeViewer._threeWrapper.CreateSpline(this._pointList);
            this._threeViewer._threeWrapper.AddEntityToScene(this._spline_temp);
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
      var spline = this._threeViewer._threeWrapper.CreateSpline(this._pointList);
      spline.name = "Spline";
      this._threeViewer.AddEntityToScene(spline);
      this._pointList = [];
    },
  },
});
