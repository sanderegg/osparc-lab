/**
  *
  * @asset(../data/outputControllerOut.json)
  */

qx.Class.define("app.ui.TableView",
{
  extend: qx.ui.container.Composite,

  construct : function(width, height, nCols)
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

    var label = new qx.ui.basic.Label("Table view").set({
      font: new qx.bom.Font(20, ["Verdana", "sans-serif"]),
      textColor: 'black'
    });
    this.add(label);

    this._createTable(nCols);
    var bar = this._createControls();
    this.add(bar, {flex: 1});
    this.add(this._table, {flex: 1});
  },

  properties: {

  },

  events : {
    "filteredDataChanged": "qx.event.type.Event",
  },

  members: {
    _table: null,
    _tableModel: null,
    _rowData: [],
    _colData: [],

    getFilteredData : function()
    {
      return this._tableModel.getData();
    },

    _createControls : function()
    {
      var bar = new qx.ui.toolbar.ToolBar();
      var part = new qx.ui.toolbar.Part();
      bar.add(part);

      var button1 = new qx.ui.toolbar.Button("Value 1: Show > 50");
      part.add(button1);
      button1.addListener("execute", function(e)
      {
        this._tableModel.addNumericFilter("<", 50, "Value 1");
        this._tableModel.applyFilters();
        this.fireDataEvent("filteredDataChanged");
        this._table.setAdditionalStatusBarText(", additional Status. Showing Value 1: > 50.");
      }, this);

      var button2 = new qx.ui.toolbar.Button("Value 2: Show 25 - 75");
      part.add(button2);
      button2.addListener("execute", function(e)
      {
        this._tableModel.addBetweenFilter("!between", 25, 75, "Value 2");
        this._tableModel.applyFilters();
        this.fireDataEvent("filteredDataChanged");
        this._table.setAdditionalStatusBarText(", additional Status. Showing Value 2: 25 - 75.");
      }, this);

      var button3 = new qx.ui.toolbar.Button("Show all");
      part.add(button3);
      button3.addListener("execute", function(e)
      {
        this._tableModel.resetHiddenRows();
        this.fireDataEvent("filteredDataChanged");
        this._table.setAdditionalStatusBarText("");
      }.bind(this));

      return bar;
    },

    _createTable : function(nCols)
    {
      this._tableModel = new qx.ui.table.model.Filtered();
      var emptyCols = [];
      for (var col = 0; col < nCols; col++) {
        emptyCols.push("Value " + col);
      }
      // Looks like this must be set at the begging
      this._tableModel.setColumns(emptyCols);

      // table
      this._table = new qx.ui.table.Table(this._tableModel);
      this._table.set({
        width: this.getWidth(),
        height: this.getHeight(),
        decorator : null
      });

      this._table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
    },

    setData : function(colData, rowData)
    {
      this._setColData(colData);
      this._setRowData(rowData);
    },

    _setColData : function(colData)
    {
      this._tableModel.setColumns(colData);
    },

    _setRowData : function(rowData)
    {
      this._tableModel.setData(rowData);
    }
  },

  destruct : function() {
    this._disposeObjects("_table");
  }
});
