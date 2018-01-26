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

    this._table = this._createTable(nCols);
    this.add(this._table, {flex: 1});
  },

  properties: {

  },

  events : {

  },

  members: {
    _table: null,
    _tableModel: null,
    _rowData: [],
    _colData: [],

    _createTable : function(nCols)
    {
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      var emptyCols = [];
      for (var col = 0; col < nCols; col++) {
        emptyCols.push("Default " + col);
      }
      // Looks like this must be set at the begging
      tableModel.setColumns(emptyCols);

      // table
      var table = new qx.ui.table.Table(tableModel);
      table.set({
        width: this.getWidth(),
        height: this.getHeight(),
        decorator : null
      });

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      return table;
    },

    setColData : function(colData)
    {
      this._tableModel.setColumns(colData);
    },

    setRowData : function(rowData)
    {
      this._tableModel.setData(rowData);
    },

    _readTableData : function()
    {
      var myArray = [];
      myArray.push([1,6,3]);
      myArray.push([2,8,2]);
      myArray.push([3,4,6]);
      return myArray;
    },
  },

  destruct : function() {
    this._disposeObjects("_table");
  }
});
