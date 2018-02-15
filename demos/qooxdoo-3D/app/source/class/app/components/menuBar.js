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

    var bar = this.getMenuBar(width, backgroundColor, fontColor);
    this.add(bar);
  },

  events : {
    "fileNewPressed": "qx.event.type.Event",
    "fileLoadEntitiesPressed": "qx.event.type.Event",
    "fileSaveEntitiesPressed": "qx.event.type.Event",
    "fileLoadScenePressed": "qx.event.type.Event",
    "fileSaveScenePressed": "qx.event.type.Event",
    "fileLoadViPPressed": "qx.event.type.Data",
  },

  members: {
    getMenuBar : function(width, backgroundColor, fontColor)
    {
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);

      var menubar = new qx.ui.menubar.MenuBar;
      menubar.set({
        width: width,
        backgroundColor: backgroundColor
      });
      frame.add(menubar);

      var fileMenu = new qx.ui.menubar.Button("File", null, this.getFileMenu());
      var editMenu = new qx.ui.menubar.Button("Edit", null, null);
      var viewMenu = new qx.ui.menubar.Button("View", null, null);
      var helpMenu = new qx.ui.menubar.Button("Help", null, null);
      var menuOpts = [fileMenu, editMenu, viewMenu, helpMenu];

      for (var i = 0; i < menuOpts.length; i++) {
        menuOpts[i].setTextColor(fontColor);
        menubar.add(menuOpts[i]);
      }

      return frame;
    },

    getFileMenu : function()
    {
      var fileMenu = new qx.ui.menu.Menu;

      var newButton = new qx.ui.menu.Button("New", null, null);
      var loadEntitiesButton = new qx.ui.menu.Button("Load entities", null, null);
      var saveEntitiesButton = new qx.ui.menu.Button("Save entities", null, null);
      var loadSceneButton = new qx.ui.menu.Button("Load scene", null, null);
      var saveSceneButton = new qx.ui.menu.Button("Save scene", null, null);
      var loadViPButton = new qx.ui.menu.Button("Load ViP", null, null, this.getViPList());

      newButton.addListener("execute", function(e) {
        this.fireDataEvent("fileNewPressed");
      }, this);

      loadEntitiesButton.addListener("execute", function(e) {
        this.fireDataEvent("fileLoadEntitiesPressed");
      }, this);

      saveEntitiesButton.addListener("execute", function(e) {
        this.fireDataEvent("fileSaveEntitiesPressed");
      }, this);

      loadSceneButton.addListener("execute", function(e) {
        this.fireDataEvent("fileLoadScenePressed");
      }, this);

      saveSceneButton.addListener("execute", function(e) {
        this.fireDataEvent("fileSaveScenePressed");
      }, this);

      fileMenu.add(newButton);
      fileMenu.add(loadEntitiesButton);
      fileMenu.add(saveEntitiesButton);
      fileMenu.add(loadSceneButton);
      fileMenu.add(saveSceneButton);
      fileMenu.add(loadViPButton);

      return fileMenu;
    },

    getViPList : function()
    {
      var vipMenu = new qx.ui.menu.Menu;

      var theoButton = new qx.ui.menu.Button("Thelonious", null, null);

      theoButton.addListener("execute", function(e) {
        this.fireDataEvent("fileLoadViPPressed", "Thelonious");
      }, this);

      vipMenu.add(theoButton);

      return vipMenu;
    },
  }
});
