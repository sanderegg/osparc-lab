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
      //sphere_btn.addListener("execute", this._addSphere.bind(this));

      menuPart.add(sphere_btn);

      return frame;
    }
  }
});
