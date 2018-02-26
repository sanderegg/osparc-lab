qx.Class.define("app.components.availableServices",
{
  extend: qx.ui.container.Composite,

  include : [qx.locale.MTranslation],

  construct : function(width, height, backgroundColor, fontColor)
  {
    this.base(arguments);

    var box = new qx.ui.layout.HBox();
    box.set({
      spacing: 10,
      //alignX: "center",
      //alignY: "middle"
    });

    this.set({
      layout: box,
      width: width,
      height: height
    });

    var bar = this.getAvailableServicesBar(width, backgroundColor);
    this.add(bar);
  },

  events : {
    "newBasicEntityRequested": "qx.event.type.Data",
    "selectionModeChanged": "qx.event.type.Data",
    "moveToolRequested": "qx.event.type.Data",
    "newSphereRequested": "qx.event.type.Data",
    "newBlockRequested": "qx.event.type.Data",
    "newDodecaRequested": "qx.event.type.Data",
    "newSplineRequested": "qx.event.type.Data",
    "booleanOperationRequested": "qx.event.type.Data",
  },

  members: {
    _menubar: null,
    _moveBtn: null,
    _sphereBtn: null,
    _blockBtn: null,
    _dodecaBtn: null,
    _splineBtn: null,

    getAvailableServicesBar : function(width, backgroundColor)
    {
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);

      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.set({
        width: width,
        backgroundColor: backgroundColor
      })
      frame.add(toolbar);

      // Model selection
      {
        var menuPart = new qx.ui.toolbar.Part;
        toolbar.add(menuPart);

        var rotate_btn = new qx.ui.toolbar.RadioButton(this.tr("Disabled"));
        rotate_btn.addListener("execute", function(e) {
          this.fireDataEvent("selectionModeChanged", 0);
        }, this);

        var sel_ent_btn = new qx.ui.toolbar.RadioButton(this.tr("Select entity"));
        sel_ent_btn.addListener("execute", function(e) {
          this.fireDataEvent("selectionModeChanged", 2);
        }, this);

        var sel_face_btn = new qx.ui.toolbar.RadioButton(this.tr("Select face"));
        sel_face_btn.addListener("execute", function(e) {
          this.fireDataEvent("selectionModeChanged", 3);
        }, this);

        menuPart.add(rotate_btn);
        menuPart.add(sel_ent_btn);
        menuPart.add(sel_face_btn);

        var radioGroup = new qx.ui.form.RadioGroup(rotate_btn, sel_ent_btn, sel_face_btn);
        radioGroup.setAllowEmptySelection(true);
      }

      // Move
      {
        var menuPart = new qx.ui.toolbar.Part;
        toolbar.add(menuPart);

        this._moveBtn = new qx.ui.toolbar.CheckBox(this.tr("Move"));
        this._moveBtn.addListener("execute", this._onMoveToolRequested.bind(this));

        menuPart.add(this._moveBtn);
      }

      // Create standard model
      {
        var menuPart = new qx.ui.toolbar.Part;
        toolbar.add(menuPart);

        this._sphereBtn = new qx.ui.toolbar.CheckBox(this.tr("Add Sphere"));
        this._sphereBtn.addListener("execute", this._onAddSphereRequested, this);

        this._blockBtn = new qx.ui.toolbar.Button(this.tr("Add Box"));
        this._blockBtn.addListener("execute", this._onAddBlockRequested.bind(this));

        this._dodecaBtn = new qx.ui.toolbar.Button(this.tr("Add Dodecahedron"));
        this._dodecaBtn.addListener("execute", this._onAddDodecaRequested.bind(this));

        this._splineBtn = new qx.ui.toolbar.CheckBox(this.tr("Add Spline"));
        this._splineBtn.addListener("execute", this._onAddSplineRequested.bind(this));

        menuPart.add(this._sphereBtn);
        menuPart.add(this._blockBtn);
        menuPart.add(this._dodecaBtn);
        menuPart.add(this._splineBtn);
      }

      // Boolean operations
      {
        var menuPart = new qx.ui.toolbar.Part;
        toolbar.add(menuPart);

        var booleanMenu = new qx.ui.toolbar.MenuButton("Boolean operations");
        booleanMenu.setMenu(this._getBooleanMenu());
        menuPart.add(booleanMenu);
      }

      return frame;
    },

    _getBooleanMenu : function()
    {
      var menu = new qx.ui.menu.Menu;

      var uniteButton = new qx.ui.menu.Button(this.tr("Unite"));
      var intersectButton = new qx.ui.menu.Button(this.tr("Intersect"));
      var substractButton = new qx.ui.menu.Button(this.tr("Substract"));

      uniteButton.addListener("execute", this._onBooleanUniteRequested.bind(this));
      intersectButton.addListener("execute", this._onBooleanIntersectRequested.bind(this));
      substractButton.addListener("execute", this._onBooleanSubstractRequested.bind(this));

      menu.add(uniteButton);
      menu.add(intersectButton);
      menu.add(substractButton);

      return menu;
    },

    OnEntitySelectedChanged : function(uuid) {
      //this._moveBtn.setEnabled(uuid !== null);
    },

    _onAddSphereRequested : function() {
      this.fireDataEvent("newSphereRequested", this._sphereBtn.getValue());
    },

    _onAddBlockRequested : function() {
      this.fireDataEvent("newBasicEntityRequested", "Box");
    },

    _onAddDodecaRequested : function() {
      this.fireDataEvent("newBasicEntityRequested", "Dodecahedron");
    },

    _onAddSplineRequested : function() {
      this.fireDataEvent("newSplineRequested", this._splineBtn.getValue());
    },

    _onMoveToolRequested : function() {
      this.fireDataEvent("moveToolRequested", this._moveBtn.getValue());
    },

    _onBooleanUniteRequested : function() {
      this.fireDataEvent("booleanOperationRequested", 0);
    },

    _onBooleanIntersectRequested : function() {
      this.fireDataEvent("booleanOperationRequested", 1);
    },

    _onBooleanSubstractRequested : function() {
      this.fireDataEvent("booleanOperationRequested", 2);
    },
  }
});
