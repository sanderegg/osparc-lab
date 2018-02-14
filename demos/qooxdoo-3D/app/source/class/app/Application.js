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
      container1.add(new qx.ui.basic.Atom("Grüezi, " + activeName).set({
        backgroundColor : this._initialStore.getColors().getMenuBar().getBackground(),
        textColor: this._initialStore.getColors().getMenuBar().getFont(),
        padding : 6,
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
        "ActiveUser" : 0,
        "Users": [
          {
            "Name": "Odei",
          },
          {
            "Name": "Sylvain",
          },
          {
            "Name": "Alessandro",
          },
        ],
      };
      return myInitialStore;
    },

    _initSignals : function() {

      const activeUserId = this._initialStore.getActiveUser();
      const activeUserName = this._initialStore.getUsers().toArray()[activeUserId].getName();

      // Menu bar
      {
        this._menuBar.addListener("fileNewPressed", function(e) {
          this._threeView.RemoveAll();
        }, this);

        this._menuBar.addListener("fileLoadMeshesPressed", function(e) {
          if (!this._socket.slotExists("importMeshes")) {
            this._socket.on("importMeshes", function(val) {
              if (val.type === "importMeshes") {
                this._threeView.ImportMeshFromBuffer(val.value, val.modelName);
              }
            }, this);
          }
          this._socket.emit("importMeshes", activeUserName);
        }, this);

        this._menuBar.addListener("fileSaveMeshesPressed", function(e) {
          this._threeView.SerializeMeshes();
        }, this);

        this._menuBar.addListener("fileLoadScenePressed", function(e) {
          if (!this._socket.slotExists("importScene")) {
            this._socket.on("importScene", function(val) {
              if (val.type === "importScene") {
                this._threeView.ImportSceneFromBuffer(val.value);
              }
            }, this);
          }
          this._socket.emit("importScene", activeUserName);
        }, this);

        this._menuBar.addListener("fileSaveScenePressed", function(e) {
          if (!this._socket.slotExists("exportScene")) {
            this._socket.on("exportScene", function(res) {
              if (res.type === "exportScene") {
                if (res.value) {
                  console.log("Scene was saved");
                } else {
                  console.log("Scene was not saved");
                }
              }
            }, this);
          }
          this._threeView.SerializeScene();
        }, this);

        this._menuBar.addListener("fileLoadViPPressed", function(e) {
          var selectedViP = e.getData();
          if (!this._socket.slotExists("importViP")) {
            this._socket.on("importViP", function(val) {
              if (val.type === "importViP") {
                this._threeView.ImportMeshFromBuffer(val.value, val.modelName);
              }
            }, this);
          }
          this._socket.emit("importViP", selectedViP);
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

        this._threeView.addListener(("MeshesToBeExported"), function(e) {
          if (!this._socket.slotExists("exportMeshes")) {
            this._socket.on("exportMeshes", function(val) {
              if (val.type === "exportMeshes") {
                console.log("Meshes exported: ", val.value);
              }
            }, this);
          }
          this._socket.emit("exportMeshes", [activeUserName, e.getData()]);
        }, this);

        this._threeView.addListener(("SceneToBeExported"), function(e) {
          if (!this._socket.slotExists("exportScene")) {
            this._socket.on("exportScene", function(val) {
              if (val.type === "exportScene") {
                console.log("Scene exported: ", val.value);
              }
            }, this);
          }
          this._socket.emit("exportScene", [activeUserName, e.getData()]);
        }, this);
      }
    },
  }
});
