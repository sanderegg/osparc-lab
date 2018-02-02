/**
 * @asset(resource/vtk/*)
 * @ignore(VTK)
 */
 qx.Class.define("app.ui.VTKView",
{
  // Latest vtk.js: https://unpkg.com/vtk.js
  extend: qx.ui.container.Composite,

  construct : function(width, height)
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

    var label = new qx.ui.basic.Label("3D view (vtk.js)").set({
      font: new qx.bom.Font(20, ["Verdana", "sans-serif"]),
      textColor: 'black'
    });
    this.add(label);


    // initialize the script loading
    var vtk_path = "resource/vtk/vtk.min.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      vtk_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(vtk_path + " loaded");
      this.setLibReady(true);

      this._VTKViewer = new qx.ui.core.Widget();
      this._VTKViewer.getContentElement().setAttribute('id', 'vtkViewer');
      this.add(this._VTKViewer, {flex: 1});

      this._VTKViewer.addListenerOnce('appear', function() {

        var vtkContainer = document.getElementById('vtkViewer');
        this._fullScreenRenderer = vtk.Rendering.Misc.vtkFullScreenRenderWindow.newInstance({
          background: [0.93, 0.93, 0.93],
          rootContainer: vtkContainer,
          containerStyle: { height: '100%', width: '100%' }
        });

        this._renderer = this._fullScreenRenderer.getRenderer();

        this._renderWindow = this._fullScreenRenderer.getRenderWindow();
        this._renderWindow.render();

        this.LoadDefault();
      }, this);

    }, this);

    dynLoader.addListener('failed', function(e) {
      var data = e.getData();
      console.log("failed to load " + data.script);
    }, this);

    dynLoader.start();
  },

  properties: {
    LibReady: { check: "Boolean" }
  },

  members: {
    _VTKViewer: null,
    _renderer: null,
    _renderWindow: null,
    _fullScreenRenderer: null,
    _actors: [],

    LoadDefault : function()
    {
      var actor = vtk.Rendering.Core.vtkActor.newInstance();
      var mapper = vtk.Rendering.Core.vtkMapper.newInstance();
      var cone = vtk.Filters.Sources.vtkConeSource.newInstance();

      actor.setMapper(mapper);
      mapper.setInputConnection(cone.getOutputPort());

      this._actors.push(actor);

      this._renderer.addActor(actor);
      this._renderer.resetCamera();

      this._renderWindow.render();
    },

    LoadVtkModel : function(modelPath)
    {
      var modelToLoad = "resource/models/" + modelPath;
      var extension = modelToLoad.slice(-3);

      if (extension === "vtk") {
        this._loadLegacyVTKModel(modelToLoad);
      } else {
        this._loadXMLVTKModel(modelToLoad);
      }
    },

    _loadLegacyVTKModel : function(modelToLoad)
    {
      var that = this;
      const reader = vtk.IO.Legacy.vtkPolyDataReader.newInstance();
      reader.setUrl(modelToLoad).then(() => {
        console.log(reader.getUrl());
        const polydata = reader.getOutputData(0);
        const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
        const actor = vtk.Rendering.Core.vtkActor.newInstance();

        mapper.setInputData(polydata);
        actor.setMapper(mapper);

        that._actors.push(actor);
        that._renderer.addActor(actor);

        that._renderer.resetCamera();
        that._renderWindow.render();
      }, that);
    },

    _loadXMLVTKModel : function(modelToLoad)
    {
      var that = this;
      const reader = vtk.IO.XML.vtkXMLPolyDataReader.newInstance();
      reader.setUrl(modelToLoad).then(() => {
        console.log(reader.getUrl());
        const source = reader.getOutputData(0);

        const lookupTable = vtk.Rendering.Core.vtkColorTransferFunction.newInstance();
        const mapper = vtk.Rendering.Core.vtkMapper.newInstance({
          interpolateScalarsBeforeMapping: false,
          useLookupTableScalarRange: true,
          lookupTable,
          scalarVisibility: false,
        });
        const actor = vtk.Rendering.Core.vtkActor.newInstance();
        //const scalars = source.getPointData().getScalars();
        //const dataRange = [].concat(scalars ? scalars.getRange() : [0, 1]);

        mapper.setInputData(source);

        actor.setMapper(mapper);

        that._actors.push(actor);
        that._renderer.addActor(actor);

        that._renderer.resetCamera();
        that._renderWindow.render();
      }, that);

      /*
      // VTK pipeline
      const reader = vtk.IO.XML.vtkXMLPolyDataReader.newInstance();
      console.log(reader);
      reader.parseArrayBuffer(modelToLoad);

      const source = reader.getOutputData(0);

      const lookupTable = vtkColorTransferFunction.newInstance();
      const mapper = vtkMapper.newInstance({
        interpolateScalarsBeforeMapping: false,
        useLookupTableScalarRange: true,
        lookupTable,
        scalarVisibility: false,
      });
      const actor = vtkActor.newInstance();
      const scalars = source.getPointData().getScalars();
      const dataRange = [].concat(scalars ? scalars.getRange() : [0, 1]);

      mapper.setInputData(source);
      actor.setMapper(mapper);

      this._actors.push(actor);
      this._renderer.addActor(actor);

      this._renderer.resetCamera();
      this._renderWindow.render();
      */
    },

    ClearScene : function()
    {
      var i = this._actors.length;
      while(i--) {
        this._renderer.removeActor(this._actors[i]);
      }
      this._renderWindow.render();
    }
  }
});
