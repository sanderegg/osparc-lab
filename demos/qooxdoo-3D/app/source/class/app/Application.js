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

  include : [qx.locale.MTranslation],

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _threeView: null,
    _entityList: null,

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

      this._appModel = qx.data.marshal.Json.createModel(this._getDefaultData());

      qx.locale.Manager.getInstance().setLocale( this._appModel.getLocaleCode() );
      qx.locale.Manager.getInstance().addListener("changeLocale", function(e) {
        qx.locale.Manager.getInstance().setLocale( e.getData() );
      }, this);

      // Document is the application root
      var doc = this.getRoot();

      // openning web socket
      this._socket = new app.wrappers.webSocket('app');
      this._socket.connect();

      var body = document.body;
      var html = document.documentElement;

      var docWidth = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
      var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

      // initialize components
      const menuBarHeight = 35;
      const avaiBarHeight = 55;

      this._menuBar = new app.components.menuBar(
        docWidth, menuBarHeight,
        this._appModel.getColors().getMenuBar().getBackground(), this._appModel.getColors().getMenuBar().getFont());

      this._userMenu = new app.components.userMenu(
        this._appModel,
        this._appModel.getColors().getMenuBar().getBackground(), this._appModel.getColors().getMenuBar().getFont());

      this._availableServicesBar = new app.components.availableServices(
        docWidth, avaiBarHeight,
        this._appModel.getColors().getToolBar().getBackground(), this._appModel.getColors().getToolBar().getFont());

      this._threeView = new app.components.threeView(
        docWidth, docHeight,
        this._appModel.getColors().get3DView().getBackground());

      this._entityList = new app.components.entityList(
        250, 300,
        this._appModel.getColors().getSettingsView().getBackground(), this._appModel.getColors().getSettingsView().getFont());


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

      doc.add(this._userMenu, { right : 30});

      this._entityList.moveTo(10, menuBarHeight + avaiBarHeight + 10);
      this._entityList.open();

      this._initSignals();
    },

    _getDefaultData : function() {
      var myDefaultData = {
        "LocaleCode" : "en",
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
            "ID": 0,
          },
          {
            "Name": "Sylvain",
            "ID": 1,
          },
          {
            "Name": "Alessandro",
            "ID": 2,
          },
        ],
        "UseExternalModeler" : 0,
        "ExportSceneAsBinary" : 0,
      };
      return myDefaultData;
    },

    _getActiveUserName : function() {
      const activeUserId = this._appModel.getActiveUser();
      return this._appModel.getUsers().toArray()[activeUserId].getName();
    },

    _initSignals : function() {
      // Menu bar
      {
        this._menuBar.addListener("fileNewPressed", function(e) {
          this._threeView.RemoveAll();
        }, this);

        this._menuBar.addListener("fileLoadEntitiesPressed", function(e) {
          if (!this._socket.slotExists("importEntities")) {
            this._socket.on("importEntities", function(val) {
              if (val.type === "importEntities") {
                this._threeView.ImportEntityFromBuffer(val.value, val.modelName);
              }
            }, this);
          }
          this._socket.emit("importEntities", this._getActiveUserName());
        }, this);

        this._menuBar.addListener("fileSaveEntitiesPressed", function(e) {
          this._threeView.SerializeEntities();
        }, this);

        this._menuBar.addListener("fileLoadScenePressed", function(e) {
          if (!this._socket.slotExists("importScene")) {
            this._socket.on("importScene", function(val) {
              if (val.type === "importScene") {
                this._threeView.ImportSceneFromBuffer(val.value);
              }
            }, this);
          }
          this._socket.emit("importScene", this._getActiveUserName());
        }, this);

        this._menuBar.addListener("fileSaveScenePressed", function(e) {
          const donwloadFile = false;
          const exportSceneAsBinary = this._appModel.getExportSceneAsBinary();
          this._threeView.SerializeScene(donwloadFile, exportSceneAsBinary);
        }, this);

        this._menuBar.addListener("fileDownloadScenePressed", function(e) {
          const donwloadFile = true;
          const exportSceneAsBinary = this._appModel.getExportSceneAsBinary();
          this._threeView.SerializeScene(donwloadFile, exportSceneAsBinary);
        }, this);

        this._menuBar.addListener("fileLoadModelPressed", function(e) {
          var selectedModel = e.getData();
          if (!this._socket.slotExists("importModel")) {
            this._socket.on("importModel", function(val) {
              if (val.type === "importModel") {
                this._threeView.CreateEntityFromResponse(val.value, val.name, val.uuid);
              }
            }, this);
          }
          this._socket.emit("importModel", selectedModel);
        }, this);

        this._menuBar.addListener("editPreferencesPressed", function(e) {
          this.ShowPreferences();
        }, this);
      }

      // Services
      {
        this._availableServicesBar.addListener("selectionModeChanged", function(e) {
          var selectionMode = e.getData();
          this._threeView.SetSelectionMode(selectionMode);
        }, this);

        this._availableServicesBar.addListener("newBlockRequested", function(e) {
          var enableBoxTool = e.getData();
          if (enableBoxTool) {
            var useExternalModeler = this._appModel.getUseExternalModeler();
            var boxCreator = new app.modeler.boxCreator(this._threeView);
            this._threeView.StartTool(boxCreator);
          } else {
            this._threeView.StopTool();
          }
        }, this);

        this._availableServicesBar.addListener("newSphereRequested", function(e) {
          var enableSphereTool = e.getData();
          if (enableSphereTool) {
            var useExternalModeler = this._appModel.getUseExternalModeler();
            if (!useExternalModeler)
            {
              var sphereCreator = new app.modeler.sphereCreator(this._threeView);
              this._threeView.StartTool(sphereCreator);
            }
            else
            {
              var sphereCreator = new app.modeler.sphereCreatorS4L(this._threeView);
              this._threeView.StartTool(sphereCreator);
              sphereCreator.addListenerOnce("newSphereS4LRequested", function(e) {
                var radius = e.getData()[0];
                var center_point = e.getData()[1];
                var uuid = e.getData()[2];
                if (!this._socket.slotExists("newSphereS4LRequested")) {
                  this._socket.on("newSphereS4LRequested", function(val) {
                    if (val.type === "newSphereS4LRequested") {
                      sphereCreator.SphereFromS4L(val);
                    }
                  }, this);
                }
                this._socket.emit("newSphereS4LRequested", [radius, center_point, uuid]);
              }, this);
            }
          } else {
            this._threeView.StopTool();
          }
        }, this);

        this._availableServicesBar.addListener("newCylinderRequested", function(e) {
          var enableCylinderTool = e.getData();
          if (enableCylinderTool) {
            var useExternalModeler = this._appModel.getUseExternalModeler();
            var cylinderCreator = new app.modeler.cylinderCreator(this._threeView);
            this._threeView.StartTool(cylinderCreator);
          } else {
            this._threeView.StopTool();
          }
        }, this);

        this._availableServicesBar.addListener("newDodecaRequested", function(e) {
          var enableDodecahedronTool = e.getData();
          if (enableDodecahedronTool) {
            var useExternalModeler = this._appModel.getUseExternalModeler();
            var dodecahedronCreator = new app.modeler.dodecahedronCreator(this._threeView);
            this._threeView.StartTool(dodecahedronCreator);
          } else {
            this._threeView.StopTool();
          }
        }, this);

        this._availableServicesBar.addListener("newSplineRequested", function(e) {
          //this._threeView.SetSelectionMode(0);
          var enableSplineTool = e.getData();
          if (enableSplineTool) {
            var useExternalModeler = this._appModel.getUseExternalModeler();
            if (!useExternalModeler)
            {
              var splineCreator = new app.modeler.splineCreator(this._threeView);
              this._threeView.StartTool(splineCreator);
            }
            else
            {
              var splineCreator = new app.modeler.splineCreatorS4L(this._threeView);
              this._threeView.StartTool(splineCreator);
              splineCreator.addListenerOnce("newSplineS4LRequested", function(e) {
                var pointList = e.getData()[0];
                var uuid = e.getData()[1];
                if (!this._socket.slotExists("newSplineS4LRequested")) {
                  this._socket.on("newSplineS4LRequested", function(val) {
                    if (val.type === "newSplineS4LRequested") {
                      splineCreator.SplineFromS4L(val);
                    }
                  }, this);
                }
                this._socket.emit("newSplineS4LRequested", [pointList, uuid]);
              }, this);
            }
          } else {
            this._threeView.StopTool();
          }
        }, this);

        this._availableServicesBar.addListener("moveToolRequested", function(e) {
          this._threeView.SetSelectionMode(0);
          var enableMoveTool = e.getData();
          if (enableMoveTool) {
            var selObjId = this._entityList.GetSelectedEntityId();
            if (selObjId) {
              this._threeView.StartMoveTool(selObjId, "translate");
            } else {
              this._availableServicesBar._moveBtn.setValue(false);
            }
          } else {
            this._threeView.StopMoveTool();
          }
        }, this);

        this._availableServicesBar.addListener("rotateToolRequested", function(e) {
          this._threeView.SetSelectionMode(0);
          var enableRotateTool = e.getData();
          if (enableRotateTool) {
            var selObjId = this._entityList.GetSelectedEntityId();
            if (selObjId) {
              this._threeView.StartMoveTool(selObjId, "rotate");
            } else {
              this._availableServicesBar._rotateBtn.setValue(false);
            }
          } else {
            this._threeView.StopMoveTool();
          }
        }, this);

        this._availableServicesBar.addListener("booleanOperationRequested", function(e) {
          var operationType = e.getData();
          if (this._threeView._entities.length>1) {
            var entityMeshesIDs = this._entityList._entities.GetSelectedEntityIds();
            if (entityMeshesIDs.length>1) {
              this._threeView._threeWrapper.CreateSceneWithMeshes(entityMeshesIDs);
              return;
            }

            var entityMeshes = [];
            for (var i = 0; i < 2; i++) {
              var entityMesh = this._threeView._threeWrapper.FromEntityToEntityMesh(this._threeView._entities[i]);
              entityMeshes.push(entityMesh);
            }
            if (!this._socket.slotExists("newBooleanOperationRequested")) {
              this._socket.on("newBooleanOperationRequested", function(val) {
                if (val.type === "newBooleanOperationRequested") {
                  this._threeView.CreateEntityFromResponse(val.value, val.name, val.uuid);
                }
              }, this);
            }
            this._socket.emit("newBooleanOperationRequested", [entityMeshes, operationType]);
          }
        }, this);
      }

      // Entity list
      {
        this._entityList.addListener("removeEntityRequested", function(e) {
          var entityId = e.getData();
          if (this._threeView.RemoveEntityByID(entityId));
            this._entityList.RemoveEntity(entityId);
        }, this);

        this._entityList.addListener("selectionChanged", function(e) {
          var entityIds = e.getData();
          this._threeView.HighlightEntities(entityIds);
        }, this);
      }

      // 3D View
      {
        this._threeView.addListener("entitySelected", function(e) {
          var entityId = e.getData();
          this._availableServicesBar.OnEntitySelectedChanged(entityId);
          this._entityList.OnEntitySelectedChanged(entityId);
        }, this);

        this._threeView.addListener("entityAdded", function(e) {
          var entityName = e.getData()[0];
          var entityId = e.getData()[1];
          this._entityList.AddEntity(entityName, entityId);
        }, this);

        this._threeView.addListener("entityRemoved", function(e) {
          var entityId = e.getData();
          this._entityList.RemoveEntity(entityId);
        }, this);

        this._threeView.addListener(("entitiesToBeExported"), function(e) {
          if (!this._socket.slotExists("exportEntities")) {
            this._socket.on("exportEntities", function(val) {
              if (val.type === "exportEntities") {
                console.log("Entities exported: ", val.value);
              }
            }, this);
          }
          this._socket.emit("exportEntities", [this._getActiveUserName(), e.getData()]);
        }, this);

        this._threeView.addListener(("sceneToBeExported"), function(e) {
          if (!this._socket.slotExists("exportScene")) {
            this._socket.on("exportScene", function(val) {
              if (val.type === "exportScene") {
                console.log("Scene exported: ", val.value);
              }
            }, this);
          }
          this._socket.emit("exportScene", [this._getActiveUserName(), e.getData()]);
        }, this);
      }
    },

    ShowPreferences : function()
    {
      var preferencesDlg = new app.components.preferences(
        this._appModel, 250, 300,
        this._appModel.getColors().getSettingsView().getBackground(), this._appModel.getColors().getSettingsView().getFont());

      preferencesDlg.open();
      preferencesDlg.center();
    },
  }
});
