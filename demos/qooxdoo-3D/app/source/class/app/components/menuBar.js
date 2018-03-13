qx.Class.define("app.components.menuBar",
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

    var bar = this.getMenuBar(width, backgroundColor, fontColor);
    this.add(bar);
  },

  events : {
    "fileNewPressed": "qx.event.type.Event",
    "fileLoadEntitiesPressed": "qx.event.type.Event",
    "fileSaveEntitiesPressed": "qx.event.type.Event",
    "fileLoadScenePressed": "qx.event.type.Event",
    "fileSaveScenePressed": "qx.event.type.Event",
    "fileDownloadScenePressed": "qx.event.type.Event",
    "fileLoadModelPressed": "qx.event.type.Data",
    "editPreferencesPressed": "qx.event.type.Data",
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

      var fileMenu = new qx.ui.menubar.Button(this.tr("File"), null, this.getFileMenu());
      var editMenu = new qx.ui.menubar.Button(this.tr("Edit"), null, this.getEditMenu());
      var viewMenu = new qx.ui.menubar.Button(this.tr("View"), null, null);
      var helpMenu = new qx.ui.menubar.Button(this.tr("Help"), null, null);
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

      var newButton = new qx.ui.menu.Button(this.tr("New"), null, null);
      var loadEntitiesButton = new qx.ui.menu.Button(this.tr("Load entities"), null, null);
      var saveEntitiesButton = new qx.ui.menu.Button(this.tr("Save entities"), null, null);
      var loadSceneButton = new qx.ui.menu.Button(this.tr("Load scene"), null, null);
      var saveSceneButton = new qx.ui.menu.Button(this.tr("Save scene"), null, null);
      var downloadSceneButton = new qx.ui.menu.Button(this.tr("Download scene"), null, null);
      var loadModelsButton = new qx.ui.menu.Button(this.tr("Load Models"), null, null, this.getModelsList());

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

      downloadSceneButton.addListener("execute", function(e) {
        this.fireDataEvent("fileDownloadScenePressed");
      }, this);

      fileMenu.add(newButton);
      fileMenu.add(loadEntitiesButton);
      fileMenu.add(saveEntitiesButton);
      fileMenu.add(loadSceneButton);
      fileMenu.add(saveSceneButton);
      fileMenu.add(downloadSceneButton);
      fileMenu.add(loadModelsButton);

      return fileMenu;
    },

    getModelsList : function()
    {
      var modelsMenu = new qx.ui.menu.Menu;

      /*
      {
        var theoButton = new qx.ui.menu.Button("Thelonious", null, null);
        theoButton.addListener("execute", function(e) {
          this.fireDataEvent("fileLoadModelPressed", "Thelonious");
        }, this);
        modelsMenu.add(theoButton);
      }
      */

      {
        var ratButton = new qx.ui.menu.Button("Rat", null, null);
        ratButton.addListener("execute", function(e) {
          this.fireDataEvent("fileLoadModelPressed", "Rat");
        }, this);
        modelsMenu.add(ratButton);
      }

      return modelsMenu;
    },

    getEditMenu : function()
    {
      var editMenu = new qx.ui.menu.Menu;

      var preferencesButton = new qx.ui.menu.Button(this.tr("Preferences"), null, null);

      preferencesButton.addListener("execute", function(e) {
        this.fireDataEvent("editPreferencesPressed");
      }, this);

      editMenu.add(preferencesButton);

      return editMenu;
    },
  }
});
