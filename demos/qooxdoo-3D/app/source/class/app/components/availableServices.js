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
  },

  members: {
    _menubar: null,
    _moveBtn: null,

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
          this.fireDataEvent("selectionModeChanged", 1);
        }, this);

        var sel_face_btn = new qx.ui.toolbar.RadioButton(this.tr("Select face"));
        sel_face_btn.addListener("execute", function(e) {
          this.fireDataEvent("selectionModeChanged", 2);
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

        var sphere_btn = new qx.ui.toolbar.Button(this.tr("Add Sphere"));
        sphere_btn.addListener("execute", this._onAddSphereRequested, this);

        var block_btn = new qx.ui.toolbar.Button(this.tr("Add Box"));
        block_btn.addListener("execute", this._onAddBlockRequested.bind(this));

        var dodeca_btn = new qx.ui.toolbar.Button(this.tr("Add Dodecahedron"));
        dodeca_btn.addListener("execute", this._onAddDodecaRequested.bind(this));

        menuPart.add(sphere_btn);
        menuPart.add(block_btn);
        menuPart.add(dodeca_btn);
      }

      return frame;
    },

    OnEntitySelectedChanged : function(uuid) {
      //this._moveBtn.setEnabled(uuid !== null);
    },

    _onAddSphereRequested : function() {
      this.fireDataEvent("newBasicEntityRequested", "Sphere");
    },

    _onAddBlockRequested : function() {
      this.fireDataEvent("newBasicEntityRequested", "Box");
    },

    _onAddDodecaRequested : function() {
      this.fireDataEvent("newBasicEntityRequested", "Dodecahedron");
    },

    _onMoveToolRequested : function() {
      this.fireDataEvent("moveToolRequested", this._moveBtn.getValue());
    },
  }
});
