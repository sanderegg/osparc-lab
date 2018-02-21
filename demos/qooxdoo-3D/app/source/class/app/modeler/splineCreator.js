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

    OnMouseDown : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];
        this._pointList.push([intersect.point.x, intersect.point.y, intersect.point.z]);

        if (this._pointList.length>1) {
          this._threeViewer._threeWrapper.RemoveFromScene(this._spline_temp)
          if (event.button === 0) {
            this._spline_temp = this._threeViewer._threeWrapper.CreateSpline(this._pointList);
            this._spline_temp.name = "Spline_temp";
            this._threeViewer._threeWrapper.AddEntityToScene(this._spline_temp);
          } else if (event.button === 2) {
            var spline = this._threeViewer._threeWrapper.CreateSpline(this._pointList);
            spline.name = "Spline";
            this._threeViewer.AddEntityToScene(spline);
            this._pointList = [];
          }
        }
      }

      return true;
    },
  },
});
