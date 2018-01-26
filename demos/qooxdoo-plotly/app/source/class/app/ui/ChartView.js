/**
 * @asset(plotly/*)
 * @ignore(Plotly)
 */
 qx.Class.define("app.ui.ChartView",
{
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

    var label = new qx.ui.basic.Label("Chart view").set({
      font: new qx.bom.Font(20, ["Verdana", "sans-serif"]),
      textColor: 'black'
    });
    this.add(label);

    this._plot = new qx.ui.core.Widget();
    this._plot.getContentElement().setAttribute('id', 'plotlyDiv');

    this.add(this._plot, {flex: 1});


    // in debug mode load the uncompressed unobfuscated scripts
    // three.js files are in resource/three/three(.min).js
    var min = '.min';
    if (qx.core.Environment.get("qx.debug")) {
      min = '';
    }

    // initialize the script loading
    var plotly_path = "resource/plotly/plotly-latest.min.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      plotly_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(plotly_path + " loaded");
      this.setLibReady(true);

      this._layout = {
        title:'Line and Scatter Plot',
        width: this.getWidth(),
        height: this.getHeight()
      };

      this._data = [];
      Plotly.newPlot('plotlyDiv', this._data, this._layout);
      this._Plotly = Plotly;
    }, this);

    dynLoader.addListener('failed', function(e) {
      var data = e.getData();
      console.log("failed to load " + data.script);
    }, this);

    dynLoader.start();
  },

  properties: {
    LibReady: { check: "Boolean" },
  },

  members: {
    _plot: null,
    _layout: null,
    _data: null,

    setData : function(colData, rowData)
    {
      /*
      var trace = {
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        type: 'scatter'
        name: 'myName'
      };
      this._data = [trace];
      */

      this._data = []
      this._layout['xaxis']['title'] = colData[0];
      for (var i = 1; i < colData.length; i++) {
        var newTrace = {
          x: [],
          y: [],
          type: 'scatter',
          name: colData[i]
        };
        this._data.push(newTrace);
      }

      for (var i = 0; i < rowData.length; i++) {
        for (var j = 1; j < rowData[i].length; j++) {
          this._data[j-1]['x'].push(rowData[i][0]);
          this._data[j-1]['y'].push(rowData[i][j]);
        }
      }

      if (this._Plotly) {
        //this._Plotly.redraw('plotlyDiv');
        this._Plotly.newPlot('plotlyDiv', this._data, this._layout);
      }
    }
  }
});
