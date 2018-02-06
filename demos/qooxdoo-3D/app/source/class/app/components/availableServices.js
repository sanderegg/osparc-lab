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
    "newBlockRequested": "qx.event.type.Event"
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

      var menuPart = new qx.ui.toolbar.Part;
      toolbar.add(menuPart);

      var sphere_btn = new qx.ui.toolbar.Button("Add Sphere");
      sphere_btn.addListener("execute", this._onAddSphereRequested.bind(this));

      var block_btn = new qx.ui.toolbar.Button("Add Block");
      block_btn.addListener("execute", this._onAddBlockRequested.bind(this));

      menuPart.add(sphere_btn);
      menuPart.add(block_btn);

      return frame;
    },

    _onAddSphereRequested: function() {
      this.fireDataEvent("newSphereRequested");
    },

    _onAddBlockRequested: function() {
      this.fireDataEvent("newBlockRequested");
    },
  }
});
