const NO_TOOL = 0;
const TOOL_ACTIVE = 1;
const ENTITY_PICKING = 2;
const FACE_PICKING = 3;

qx.Class.define("app.components.threeView",
{
  extend: qx.ui.container.Composite,

  construct : function(width, height, backgroundColor)
  {
    this.base(arguments);
    this.set({
      width: width,
      height: height
    });

    var box = new qx.ui.layout.VBox();
    box.set({
      spacing: 10,
      alignX: "center",
      alignY: "middle"
    });

    this.set({
      layout: box
    });

    this._threeWrapper = new app.wrappers.threeWrapper();

    this._threeWrapper.addListener(("ThreeLibReady"), function(e) {
      var ready = e.getData();
      if (ready) {
        this._threeDViewer = new qx.ui.core.Widget();
        this.add(this._threeDViewer, {flex: 1});

        this._threeDViewer.addListenerOnce('appear', function() {

          this._threeDViewer.getContentElement().getDomElement().appendChild(this._threeWrapper.GetDomElement());

          this._threeWrapper.SetBackgroundColor(backgroundColor);
          //this._threeWrapper.SetCameraPosition(18, 0, 25);
          this._threeWrapper.SetCameraPosition(21, 21, 9); // Z up
          this._threeWrapper.SetSize(this.getWidth(), this.getHeight());

          document.addEventListener( 'mousedown', this._onMouseDown.bind(this), false );
          document.addEventListener( 'mousemove', this._onMouseHover.bind(this), false );
          this._render();

        }, this);
      } else {
        console.log("Three.js was not loaded");
      }
    }, this);

    this._threeWrapper.addListener(("EntityToBeAdded"), function(e) {
      var newEntity = e.getData();
      if (newEntity) {
        this.AddEntityToScene(newEntity);
      }
    }, this);

    this._threeWrapper.addListener(("sceneToBeExported"), function(e) {
      this.fireDataEvent("sceneToBeExported", e.getData());
    }, this);
  },

  events : {
    "entitySelected": "qx.event.type.Data",
    "entityAdded": "qx.event.type.Data",
    "entityRemoved": "qx.event.type.Data",
    "entitiesToBeExported": "qx.event.type.Data",
    "sceneToBeExported": "qx.event.type.Data",
  },

  members: {
    _threeDViewer: null,
    _threeWrapper: null,
    _transformControls: [],
    _entities: [],
    _intersected: null,
    _selectionMode: NO_TOOL,
    _activeTool: null,

    _render : function()
    {
      this._threeWrapper.Render();
    },

    _updateTransformControls : function()
    {
      for (var i = 0; i < this._transformControls.length; i++) {
        this._transformControls[i].update();
      }
      this._render();
    },

    _onMouseHover : function( event ) {
      event.preventDefault();
      if (this._selectionMode === NO_TOOL ||
        //hacky
        event.target.nodeName != 'CANVAS') {
        //this.fireDataEvent("entitySelected", null);
        return;
      }

      var posX = ( event.clientX / window.innerWidth ) * 2 - 1;
      var posY = - ( event.clientY / window.innerHeight ) * 2 + 1;

      if (this._selectionMode === TOOL_ACTIVE && this._activeTool)
      {
        var intersects = this._threeWrapper.IntersectEntities(this._entities, posX, posY);
        var attended = this._activeTool.OnMouseHover(event, intersects);
        if (attended) {
          return;
        }
      }
    },

    _onMouseDown : function( event ) {
      event.preventDefault();
      if (this._selectionMode === NO_TOOL ||
        //hacky
        event.target.nodeName != 'CANVAS') {
        //this.fireDataEvent("entitySelected", null);
        return;
      }

      var posX = ( event.clientX / window.innerWidth ) * 2 - 1;
      var posY = - ( event.clientY / window.innerHeight ) * 2 + 1;

      if (this._selectionMode === TOOL_ACTIVE && this._activeTool)
      {
        var intersects = this._threeWrapper.IntersectEntities(this._entities, posX, posY);
        var attended = this._activeTool.OnMouseDown(event, intersects);
        if (attended) {
          return;
        }
      }

      var intersects = this._threeWrapper.IntersectEntities(this._entities, posX, posY);
      if (intersects.length > 0)
      {
        if(this._intersected != null) {
          if (this._selectionMode === ENTITY_PICKING) {
            this._intersected.object.material.opacity = 0.6;
          } else if (this._selectionMode === FACE_PICKING) {
            this._intersected.face.color.setHex(this._intersected.currentHex);
          }
        }
        this._intersected = intersects[0];

        if (this._selectionMode === ENTITY_PICKING) {
          this.fireDataEvent("entitySelected", this._intersected.object.uuid);
          this._intersected.currentHex = this._intersected.object.material.color.getHex();
          this._intersected.object.material.opacity = 0.9;
        } else if (this._selectionMode === FACE_PICKING) {
          this.fireDataEvent("entitySelected", null);
          this._intersected.currentHex = this._intersected.face.color.getHex();
          const highlightedColor = 0x000000;
          this._intersected.face.color.setHex(highlightedColor);
        }

        this._intersected.object.geometry.__dirtyColors = true;
        this._intersected.object.geometry.colorsNeedUpdate = true;
      } else {
    		if (this._intersected) {
          this.fireDataEvent("entitySelected", null);
          if (this._selectionMode === ENTITY_PICKING) {
            this._intersected.object.material.opacity = 0.6;
          } else if (this._selectionMode === FACE_PICKING) {
            this._intersected.face.color.setHex(this._intersected.currentHex);
          }
          this._intersected.object.geometry.__dirtyColors = true;
          this._intersected.object.geometry.colorsNeedUpdate = true;
    		}
    		// remove previous intersection object reference
    		this._intersected = null;
      }

      this._render();
    },

    AddEntityToScene : function(entity)
    {
      this._threeWrapper.AddEntityToScene(entity);
      this._entities.push(entity);
      this.fireDataEvent("entityAdded", [entity.uuid, entity.name]);
    },

    RemoveAll : function()
    {
      for (var i = this._entities.length-1; i >= 0 ; i--) {
        this.RemoveEntity(this._entities[i]);
      }
    },

    RemoveEntity : function(entity)
    {
      var uuid = null;
      for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i] === entity) {
          uuid = this._entities[i].uuid;
          this._entities.splice(i, 1);
          break;
        }
      }

      if (uuid) {
        this._threeWrapper.RemoveFromSceneById(uuid);
        this.fireDataEvent("entityRemoved", uuid);
        this._render();
      }
    },

    RemoveEntityByID : function(uuid)
    {
      for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i].uuid === uuid) {
          this.RemoveEntity(this._entities[i]);
          return;
        }
      }
    },

    StartTool : function(myTool)
    {
      this._activeTool = myTool;
      this._activeTool.StartTool();
      this.SetSelectionMode(TOOL_ACTIVE);
    },

    StopTool : function()
    {
      if (this._activeTool) {
        this._activeTool.StopTool();
      }
      this._activeTool = null;
      this.SetSelectionMode(NO_TOOL);
    },

    AddInvisiblePlane : function(fixed_axe = 2, fixed_position = 0)
    {
      var instersection_plane = this._threeWrapper.CreateInvisiblePlane(fixed_axe, fixed_position);
      instersection_plane.name = "InvisiblePlaneForSnapping";
      this._entities.push(instersection_plane);
    },

    RemoveInvisiblePlane : function()
    {
      for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i].name === "InvisiblePlaneForSnapping") {
          this._entities.splice(i, 1);
          break;
        }
      }
    },

    StartMoveTool : function( selObjId, mode )
    {
      for (var i = 0; i < this._entities.length; i++) {
        if (this._entities[i].uuid === selObjId) {
          var transformControl = this._threeWrapper.CreateTransformControls();
          transformControl.addEventListener('change', this._updateTransformControls.bind(this));
          if (mode === "rotate") {
            transformControl.setMode("rotate");
          } else {
            transformControl.setMode("translate");
          }
          transformControl.attach(this._entities[i]);
          this._transformControls.push(transformControl);
          this._threeWrapper.AddEntityToScene(transformControl);
        }
      }
      this._render();
    },

    StopMoveTool : function()
    {
      for (var i = 0; i < this._transformControls.length; i++) {
        if (this._threeWrapper.RemoveFromScene(this._transformControls[i])) {
          this._transformControls[i].detach();
        }
      }
      this._transformControls = [];
      this._render();
    },

    SetSelectionMode : function( mode )
    {
      if (mode === FACE_PICKING) {
        this._showEdges(true);
        this._highlightAll();
      } else {
        this._showEdges(false);
        this._unhighlightAll();
      }

      this._selectionMode = mode;
      this.StopMoveTool();
      this._render();
    },

    CreateEntityFromResponse : function(response, name, uuid)
    {
      var sphereGeometry = this._threeWrapper.FromEntityMeshToEntity(response[0]);
      //var sphereMaterial = this._threeWrapper.CreateMeshNormalMaterial();
      var color = response[0].material.diffuse;
      var sphereMaterial = this._threeWrapper.CreateNewMaterial(color.r, color.g, color.b);
      var entity = this._threeWrapper.CreateEntity(sphereGeometry, sphereMaterial);

      this._threeWrapper.ApplyTransformationMatrixToEntity(entity, response[0].transform4x4)

      entity.name = name;
      entity.uuid = uuid;
      this.AddEntityToScene(entity);
    },

    _highlightAll : function()
    {
      for (var i = 0; i < this._entities.length; i++) {
        this._entities[i].material.opacity = 0.9;
      }
    },

    _unhighlightAll : function()
    {
      for (var i = 0; i < this._entities.length; i++) {
        this._entities[i].material.opacity = 0.6;
      }
    },

    HighlightEntities : function( ids )
    {
      this._unhighlightAll();
      for (var i = 0; i < this._entities.length; i++) {
        if (ids.indexOf(this._entities[i].uuid) >= 0) {
          this._entities[i].material.opacity = 0.9;
        }
      }
      this._render();
    },

    _showEdges : function( show_edges )
    {
      if (show_edges) {
        for (var i = 0; i < this._entities.length; i++) {
          var wireframe = this._threeWrapper.CreateWireframeFromGeometry(this._entities[i].geometry);
          this._entities[i].add( wireframe );
        }
      } else {
        for (var i = 0; i < this._entities.length; i++) {
          var wireObj = this._entities[i].getObjectByName("wireframe");
          if (wireObj) {
            this._entities[i].remove(wireObj);
          }
        }
      }
      this._render();
    },

    ImportEntityFromBuffer : function (model_buffer, model_name)
    {
      this._threeWrapper.ImportEntityFromBuffer(model_buffer, model_name);
    },

    SerializeEntities : function()
    {
      var entities_array = [];
      for (var i = 0; i < this._entities.length; i++) {
        var entity_to_export = this._threeWrapper.ExportEntity(this._entities[i]);
        var entity_name = 'model_' + i.toString() + '.obj';
        var entity_json = {
          name: entity_name,
          data: entity_to_export
        };
        entities_array.push(entity_json);
      }
      this.fireDataEvent("entitiesToBeExported", entities_array);
    },

    ImportSceneFromBuffer : function (model_buffer)
    {
      this._threeWrapper.ImportSceneFromBuffer(model_buffer);
    },

    SerializeScene : function()
    {
      this._threeWrapper.ExportScene();
    },
  }
});
