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

      // openning web socket
      this._socket = new app.api.WebSocket('app');
      this._socket.connect();

      var body = document.body;
      var html = document.documentElement;

      var docWidth = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
      var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

      this._initialStore = qx.data.marshal.Json.createModel(this._getInitialStore());

      // initialize components
      const menuBarHeight = 35;
      const avaiBarHeight = 55;

      this._menuBar = new app.components.menuBar(
        docWidth, menuBarHeight,
        this._initialStore.getColors().getMenuBar().getBackground(), this._initialStore.getColors().getMenuBar().getFont());

      this._availableServicesBar = new app.components.availableServices(
        docWidth, avaiBarHeight,
        this._initialStore.getColors().getToolBar().getBackground(), this._initialStore.getColors().getToolBar().getFont());

      this._threeView = new app.components.threeView(
        docWidth, docHeight,
        this._initialStore.getColors().get3DView().getBackground());

      this._objectList = new app.components.objectList(
        250, 300,
        this._initialStore.getColors().getSettingsView().getBackground(), this._initialStore.getColors().getSettingsView().getFont());


      // components to document
      doc.add(this._threeView);

      var toolBarcontainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(1)).set({
        backgroundColor: "white",
        allowGrowY: false
      });
      toolBarcontainer.add(this._menuBar);
      toolBarcontainer.add(this._availableServicesBar);
      //toolBarcontainer.add(this._threeView);
      doc.add(toolBarcontainer);

      this._objectList.moveTo(10, menuBarHeight + avaiBarHeight + 10);
      this._objectList.open();


      var activeUser = this._initialStore.getActiveUser();
      var activeName = this._initialStore.getUsers().toArray()[activeUser].getName();
      var container1 = new qx.ui.container.Composite(new qx.ui.layout.HBox(1));
      container1.add(new qx.ui.basic.Atom("Hello, " + activeName).set({
        backgroundColor : this._initialStore.getColors().getMenuBar().getBackground(),
        textColor: this._initialStore.getColors().getMenuBar().getFont(),
        padding : 7,
        allowGrowY: false,
      }));
      doc.add(container1, { right : 30});

      this._initSignals();
    },

    _getInitialStore : function() {
      var myInitialStore = {
        "Colors": {
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
        },
        "ActiveUser" : 2,
        "Users": [
          {
            "Name": "Odei",
            "NumberOfItems": 3,
          },
          {
            "Name": "Sylvain",
            "NumberOfItems": 1,
          },
          {
            "Name": "Alessandro",
            "NumberOfItems": 1,
          },
        ],
      };
      return myInitialStore;
    },

    _initSignals : function() {
      // Menu bar
      {
        var activeUser = this._initialStore.getActiveUser();
        var activeUserName = this._initialStore.getUsers().toArray()[activeUser].getName();
        var models_path = 'resource/models/' + activeUserName;

        this._menuBar.addListener("fileNewPressed", function(e) {
          this._threeView.RemoveAll();
        }, this);

        this._menuBar.addListener("fileLoadPressed", function(e) {
          const modelsToLoad = this._initialStore.getUsers().toArray()[activeUser].getNumberOfItems();
          for (var i = 0; i < modelsToLoad; i++) {
            this._threeView.ImportMeshFromPath(models_path + '/', 'model_'+i.toString()+'.obj');
          }
        }, this);

        this._menuBar.addListener("fileLoadFromServerPressed", function(e) {
          this._socket.emit("loadFromServer", models_path);
          this._socket.on("loadFromServer", function(val) {
            if (val.type === "loadFromServer") {
              this._threeView.ImportMeshFromBuffer(val.value, val.modelName);
            }
          }, this);
        }, this);

        this._menuBar.addListener("fileSavePressed", function(e) {
          this._threeView.SerializeMeshes(models_path);
        }, this);
      }

      // Services
      {
        this._availableServicesBar.addListener("selectionModeChanged", function(e) {
          var selectionMode = e.getData();
          this._threeView.SetSelectionMode(selectionMode);
        }, this);

        this._availableServicesBar.addListener("newBasicObjectRequested", function(e) {
          var objectTypeName = e.getData();
          this._threeView.AddObject(objectTypeName, 3);
        }, this);

        this._availableServicesBar.addListener("moveToolRequested", function(e) {
          this._threeView.SetSelectionMode(0);
          var enableMoveTool = e.getData();
          if (enableMoveTool) {
            var selObjId = this._objectList.GetSelectedObjectId();
            if (selObjId) {
              this._threeView.StartMoveTool(selObjId);
            } else {
              this._availableServicesBar._moveBtn.setValue(false);
            }
          } else {
            this._threeView.StopMoveTool();
          }
        }, this);
      }

      // Objects list
      {
        this._objectList.addListener("removeObjectRequested", function(e) {
          var entityId = e.getData();
          if (this._threeView.RemoveObject(entityId));
            this._objectList.RemoveObject(entityId);
        }, this);

        this._objectList.addListener("selectionChanged", function(e) {
          var entityId = e.getData();
          this._threeView.HighlightObject(entityId);
        }, this);
      }

      // 3D View
      {
        this._threeView.addListener("entitySelected", function(e) {
          var entityId = e.getData();
          this._availableServicesBar.OnEntitySelectedChanged(entityId);
          this._objectList.OnEntitySelectedChanged(entityId);
        }, this);

        this._threeView.addListener("entityAdded", function(e) {
          var entityName = e.getData()[0];
          var entityId = e.getData()[1];
          this._objectList.AddObject(entityName, entityId);
        }, this);

        this._threeView.addListener("entityRemoved", function(e) {
          var entityId = e.getData();
          this._objectList.RemoveObject(entityId);
        }, this);
      }
    },
  }
});
