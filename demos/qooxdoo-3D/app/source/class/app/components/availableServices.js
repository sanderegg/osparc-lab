qx.Class.define("app.components.availableServices",
{
  extend: qx.ui.container.Composite,

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
    "newSphereRequested": "qx.event.type.Event",
    "newBlockRequested": "qx.event.type.Event",
    "selectionModeChanged": "qx.event.type.Data",
  },

  members: {
    _menubar: null,

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

        var rotate_btn = new qx.ui.toolbar.RadioButton("Disabled");
        rotate_btn.addListener("execute", function(e) {
          this.fireDataEvent("selectionModeChanged", 0);
        }, this);

        var sel_ent_btn = new qx.ui.toolbar.RadioButton("Select entity");
        sel_ent_btn.addListener("execute", function(e) {
          this.fireDataEvent("selectionModeChanged", 1);
        }, this);

        var sel_face_btn = new qx.ui.toolbar.RadioButton("Select face");
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

        var move_btn = new qx.ui.toolbar.Button("Move");
        move_btn.setEnabled(false);
        move_btn.addListener("execute", this._onAddSphereRequested.bind(this));

        menuPart.add(move_btn);
      }

      // Create standard model
      {
        var menuPart = new qx.ui.toolbar.Part;
        toolbar.add(menuPart);

        var sphere_btn = new qx.ui.toolbar.Button("Add Sphere");
        sphere_btn.addListener("execute", this._onAddSphereRequested, this);

        var block_btn = new qx.ui.toolbar.Button("Add Block");
        block_btn.addListener("execute", this._onAddBlockRequested.bind(this));

        menuPart.add(sphere_btn);
        menuPart.add(block_btn);
      }

      return frame;
    },

    _onSelectionModeChanged: function() {
      this.fireDataEvent("newSphereRequested");
    },

    _onAddSphereRequested: function() {
      this.fireDataEvent("newSphereRequested");
    },

    _onAddBlockRequested: function() {
      this.fireDataEvent("newBlockRequested");
    },
  }
});
