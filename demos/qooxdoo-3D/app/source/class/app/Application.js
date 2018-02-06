/* ************************************************************************

   Copyright: 2018 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "app"
 *
 * @asset(app/*)
 */
qx.Class.define("app.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _threeView: null,
    _objectList: null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Document is the application root
      var doc = this.getRoot();

      var body = document.body;
      var html = document.documentElement;

      var docWidth = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
      var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

      this._initialStore = qx.data.marshal.Json.createModel(this._getInitialStore());


      // initialize components
      const menuBarHeight = 35;
      const avaiBarHeight = 55;

      this._threeView = new app.components.threeView(
        docWidth, docHeight,
        this._initialStore.get3DView().getBackground());

      this._menuBar = new app.components.menuBar(
        docWidth, menuBarHeight,
        this._initialStore.getMenuBar().getBackground(), this._initialStore.getMenuBar().getFont());

      this._availableServicesBar = new app.components.availableServices(
        docWidth, avaiBarHeight,
        this._initialStore.getToolBar().getBackground(), this._initialStore.getToolBar().getFont());

      this._objectList = new app.components.objectList(
        250, 300,
        this._initialStore.getSettingsView().getBackground(), this._initialStore.getSettingsView().getFont());


      // signals
      this._availableServicesBar.addListener("newSphereRequested", function(e) {
        this._addSphere(e.getData());
      }, this);

      this._availableServicesBar.addListener("newBlockRequested", function(e) {
        this._addBlock(e.getData());
      }, this);


      // components to document
      doc.add(this._threeView);

      var toolBarcontainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(1)).set({
        backgroundColor: "white",
        allowGrowY: false
      });
      toolBarcontainer.add(this._menuBar);
      toolBarcontainer.add(this._availableServicesBar);
      doc.add(toolBarcontainer);

      this._objectList.moveTo(10, menuBarHeight + avaiBarHeight + 10);
      this._objectList.open();
    },

    _getInitialStore : function() {
      var myInitialStore = {
        "MenuBar": {
          "Background": "#535353", // 83, 83, 83
          "Font": "#FFFFFF", // 255, 255, 255
        },
        "ToolBar": {
          "Background": "#252526", // 37, 37, 38
          "Font": "#FFFFFF", // 255, 255, 255
        },
        "SettingsView": {
          "Background": "#252526", // 37, 37, 38
          "Font": "#FFFFFF", // 255, 255, 255
        },
        "3DView": {
          "Background": "#3F3F3F", // 63, 63, 63
        },
      };
      return myInitialStore;
    },

    _addSphere : function()
    {
      var mesh = this._threeView.AddSphere("Sphere", 3);
      this._objectList.AddObject(mesh.uuid, mesh.name);
    },

    _addBlock : function()
    {
      var mesh = this._threeView.AddBlock("Block", 3);
      this._objectList.AddObject(mesh.uuid, mesh.name);
    }
  }
});
