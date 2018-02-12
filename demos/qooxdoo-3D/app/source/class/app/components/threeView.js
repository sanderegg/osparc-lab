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

    this.setLibReady(false);

    var box = new qx.ui.layout.VBox();
    box.set({
      spacing: 10,
      alignX: "center",
      alignY: "middle"
    });

    this.set({
      layout: box
    });

    this._threeWrapper = new app.components.threeWrapper();

    this._threeWrapper.addListener(("ThreeLibReady"), function(e) {
      var ready = e.getData();
      if (ready) {
        this._threeDViewer = new qx.ui.core.Widget();
        this.add(this._threeDViewer, {flex: 1});

        this._threeDViewer.addListenerOnce('appear', function() {

          this._threeDViewer.getContentElement().getDomElement().appendChild(this._threeWrapper.GetDomElement());

          this._threeWrapper.SetBackgroundColor(backgroundColor);
          this._threeWrapper.SetCameraPosition(18, 0, 25);
          this._threeWrapper.SetSize(this.getWidth(), this.getHeight());

          document.addEventListener( 'mousedown', this._onDocumentMouseDown.bind(this), false );
          this._render();

        }, this);
      } else {
        console.log("Three.js was not loaded");
      }
    }, this);

    this._threeWrapper.addListener(("MeshToBeAdded"), function(e) {
      var newMesh = e.getData();
      if (newMesh) {
        this.AddMeshToScene(newMesh);
      }
    }, this);
  },

  properties: {
    LibReady: { check: "Boolean" }
  },

  events : {
    "entitySelected": "qx.event.type.Data",
    "entityAdded": "qx.event.type.Data",
    "entityRemoved": "qx.event.type.Data",
  },

  members: {
    _threeDViewer: null,
    _threeWrapper: null,
    _transformControls: [],
    _meshes: [],
    _intersected: null,
    _selectionMode: 0,

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

    _onDocumentMouseDown : function( event ) {
      event.preventDefault();
      if (this._selectionMode === 0 ||
        //hacky
        event.target.nodeName != 'CANVAS') {
        //this.fireDataEvent("entitySelected", null);
        return;
      }

      const highlightedColor = 0x000000;

      var posX = ( event.clientX / window.innerWidth ) * 2 - 1;
      var posY = - ( event.clientY / window.innerHeight ) * 2 + 1;
      var intersects = this._threeWrapper.IntersectMeshes(this._meshes, posX, posY);
      if (intersects.length > 0)
      {
        if(this._intersected != null) {
          if (this._selectionMode === 1) {
            this._intersected.object.material.opacity = 0.6;
          } else if (this._selectionMode === 2) {
            this._intersected.face.color.setHex(this._intersected.currentHex);
          }
        }
        this._intersected = intersects[0];

        if (this._selectionMode === 1) {
          this.fireDataEvent("entitySelected", this._intersected.object.uuid);
          this._intersected.currentHex = this._intersected.object.material.color.getHex();
          this._intersected.object.material.opacity = 0.9;
        } else if (this._selectionMode === 2) {
          this.fireDataEvent("entitySelected", null);
          this._intersected.currentHex = this._intersected.face.color.getHex();
          this._intersected.face.color.setHex(highlightedColor);
        }

        this._intersected.object.geometry.__dirtyColors = true;
        this._intersected.object.geometry.colorsNeedUpdate = true;
      } else {
    		if (this._intersected) {
          this.fireDataEvent("entitySelected", null);
          if (this._selectionMode === 1) {
            this._intersected.object.material.opacity = 0.6;
          } else if (this._selectionMode === 2) {
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

    AddMeshToScene : function(mesh)
    {
      this._threeWrapper.AddObjectToScene(mesh);
      this._meshes.push(mesh);
      this.fireDataEvent("entityAdded", [mesh.uuid, mesh.name]);
    },

    AddObject : function(objType = "Sphere", scale = 1)
    {
      var geometry;

      switch (objType) {
        case "Sphere":
          geometry = this._threeWrapper.CreateSphere(scale);
          break;
        case "Box":
          geometry = this._threeWrapper.CreateBox(scale);
          break;
        case "Dodecahedron":
          geometry = this._threeWrapper.CreateDodecahedron(scale);
          break;
        default:
          break;
      }

      if (geometry) {
        var material = this._threeWrapper.CreateNewMaterial();
        var mesh = this._threeWrapper.CreateMesh(geometry, material);
        mesh.name = objType;
        this.AddMeshToScene(mesh);
        return mesh;
      } else {
        console.log(name, " not implemented yet");
      }
    },

    RemoveAll : function()
    {
      for (var i = this._meshes.length-1; i >= 0 ; i--) {
        this.RemoveObject(this._meshes[i].uuid);
      }
    },

    RemoveObject : function(uuid)
    {
      this._threeWrapper.RemoveFromSceneById(uuid);

      for (var i = 0; i < this._meshes.length; i++) {
        if (this._meshes[i].uuid === uuid) {
          if (i > -1) {
            var el = this._meshes.splice(i, 1);
            //delete el;
          }
          break;
        }
      }

      this.fireDataEvent("entityRemoved", uuid);

      this._render();
    },

    StartMoveTool : function( selObjId )
    {
      for (var i = 0; i < this._meshes.length; i++) {
        if (this._meshes[i].uuid === selObjId) {
          var transformControl = this._threeWrapper.CreateTransformControls();
          transformControl.addEventListener('change', this._updateTransformControls.bind(this));
          transformControl.setMode("translate");
          transformControl.attach(this._meshes[i]);
          this._transformControls.push(transformControl);
          this._threeWrapper.AddObjectToScene(transformControl);
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
      if (mode === 2) {
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

    _highlightAll : function()
    {
      for (var i = 0; i < this._meshes.length; i++) {
        this._meshes[i].material.opacity = 0.9;
      }
    },

    _unhighlightAll : function()
    {
      for (var i = 0; i < this._meshes.length; i++) {
        this._meshes[i].material.opacity = 0.6;
      }
    },

    HighlightObject : function( id )
    {
      this._unhighlightAll();
      for (var i = 0; i < this._meshes.length; i++) {
        if (this._meshes[i].uuid === id) {
          this._meshes[i].material.opacity = 0.9;
        }
      }
      this._render();
    },

    _showEdges : function( show_edges )
    {
      if (show_edges) {
        for (var i = 0; i < this._meshes.length; i++) {
          var wireframe = this._threeWrapper.CreateWireframeFromGeometry(this._meshes[i].geometry);
          this._meshes[i].add( wireframe );
        }
      } else {
        for (var i = 0; i < this._meshes.length; i++) {
          var wireObj = this._meshes[i].getObjectByName("wireframe");
          if (wireObj) {
            this._meshes[i].remove(wireObj);
          }
        }
      }
      this._render();
    },

    ImportMesh : function (model_name)
    {
      const models_path = 'resource/models/';
      this._threeWrapper.ImportMesh(models_path, model_name);
    },

    SerializeMeshes : function()
    {
      for (var i = 0; i < this._meshes.length; i++) {
        var mesh_to_export = this._threeWrapper.ExportMesh(this._meshes[i]);
        var mesh_name = 'model_' + i.toString() + '.obj';
        console.log(mesh_to_export);
      }
    },
  }
});
