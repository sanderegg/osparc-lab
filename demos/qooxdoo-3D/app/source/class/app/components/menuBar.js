qx.Class.define("app.components.menuBar",
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

    this.createCommands();
    var bar = this.getMenuBar(width, backgroundColor, fontColor);
    this.add(bar);
  },

  members: {

    createCommands : function()
    {
    },

    getMenuBar : function(width, backgroundColor, fontColor)
    {
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);

      var menubar = new qx.ui.menubar.MenuBar;
      menubar.set({
        width: width,
        backgroundColor: backgroundColor
      });
      frame.add(menubar);
      /*
      var fileMenu = new qx.ui.menubar.Button("File", null, this.getFileMenu());
      var editMenu = new qx.ui.menubar.Button("Edit", null, this.getEditMenu());
      var viewMenu = new qx.ui.menubar.Button("View", null, this.getViewMenu());
      var helpMenu = new qx.ui.menubar.Button("Help", null, this.getHelpMenu());
      */
      var fileMenu = new qx.ui.menubar.Button("File", null, null);
      var editMenu = new qx.ui.menubar.Button("Edit", null, null);
      var viewMenu = new qx.ui.menubar.Button("View", null, null);
      var helpMenu = new qx.ui.menubar.Button("Help", null, null);
      var menuOpts = [fileMenu, editMenu, viewMenu, helpMenu];

      for (var i = 0; i < menuOpts.length; i++) {
        menuOpts[i].setTextColor(fontColor);
        menubar.add(menuOpts[i]);
      }

      return frame;
    }
  }
});
