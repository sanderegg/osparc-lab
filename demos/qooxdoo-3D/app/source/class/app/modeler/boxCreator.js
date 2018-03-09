qx.Class.define("app.modeler.boxCreator", {
  extend: qx.core.Object,

  construct : function(threeViewer)
  {
    this._threeView = threeViewer;
  },

  members : {
    _threeView: null,
    _steps: { corner0: 0, corner1: 1, corner2: 2 },
    _nextStep: 0,
    _corner0Pos: null,
    _corner1Pos: null,
    _corner2Pos: null,
    _plane_material: null,
    _square_temp: null,
    _box_material: null,
    _box_temp: null,

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
      if (this._square_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._square_temp);
      }
      if (this._box_temp) {
        this._threeView._threeWrapper.RemoveFromScene(this._box_temp);
      }
    },

    OnMouseHover : function(event, intersects)
    {
      if (intersects.length > 0 )
      {
        var intersect = intersects[0];
        if (this._nextStep === this._steps.corner1)
        {
          this._removeTemps();

          var squareGeometry = this._threeView._threeWrapper.CreateBox( this._corner0Pos, intersect.point );
          if (this._plane_material === null) {
            this._plane_material = this._threeView._threeWrapper.CreateNewPlaneMaterial();
          }
          this._square_temp = this._threeView._threeWrapper.CreateEntity(squareGeometry, this._plane_material);
          this._threeView._threeWrapper.AddEntityToScene(this._square_temp);
        }
        else if (this._nextStep === this._steps.corner2)
        {
          this._removeTemps();

          var boxGeometry = this._threeView._threeWrapper.CreateBox( this._corner0Pos, this._corner1Pos, intersect.point );
          if (this._box_material === null) {
            this._box_material = this._threeView._threeWrapper.CreateNewMaterial(this._plane_material.color.r, this._plane_material.color.g, this._plane_material.color.b);
          }
          this._box_temp = this._threeView._threeWrapper.CreateEntity(boxGeometry, this._box_material);
          this._threeView._threeWrapper.AddEntityToScene(this._box_temp);
        }
      }
      return true;
    },

    OnMouseDown : function(event, intersects)
    {
      if (intersects.length > 0)
      {
        var intersect = intersects[0];

        if (this._corner0Pos === null) {
          this._corner0Pos = intersect.point;
          this._nextStep = this._steps.corner1;
        }
        else if (this._corner1Pos === null)
        {
          this._corner1Pos = intersect.point;
          this._nextStep = this._steps.corner2;
          this._threeView.RemoveInvisiblePlane();
          this._threeView.AddInvisiblePlane(0, this._corner1Pos.x);
        }
        else if (this._corner2Pos === null)
        {
          this._corner2Pos = intersect.point;
          this._consolidateBox();
          this._nextStep = 3;
        }
      }

      return true;
    },

    _consolidateBox : function()
    {
      this._removeTemps();
      if (this._square_temp) {
        this._square_temp = null;
      }
      if (this._box_temp) {
        this._box_temp = null;
      }

      var geometry = this._threeView._threeWrapper.CreateBox( this._corner0Pos, this._corner1Pos, this._corner2Pos );
      if (this._box_material === null) {
        this._box_material = this._threeView._threeWrapper.CreateNewMaterial();
      }
      var entity = this._threeView._threeWrapper.CreateEntity(geometry, this._box_material);
      entity.name = "Box";
      this._threeView.AddEntityToScene(entity);
      this._threeView.StopTool();
    },
  },
});
