/**
  *
  * @asset(../data/outputControllerOut.json)
  */

qx.Class.define("app.ui.TableView",
{
  extend: qx.ui.container.Composite,

  construct : function(width, height)
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

    this._table = this._createTable();
    this.add(this._table, {flex: 1});
  },

  properties: {

  },

  events : {

  },

  members: {
    _table: null,

    getCaption : function() {
      return "Table";
    },

    _createTable : function()
    {
      // table model
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["Time", "Value 1", "Value 2"]);
      //var dataFromJson = this._readTableData();
      //tableModel.setData(dataFromJson);
      var rowData = this._createRandomRows(3, 50);
      tableModel.setData(rowData);

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

    CallbackParamName : function()
    {
      console.log("Hallo");
    },

    _readTableData : function()
    {
      var myArray = [];
      myArray.push([1,6,3]);
      myArray.push([2,8,2]);
      myArray.push([3,4,6]);
      return myArray;
    },

    _createRandomRows : function(colCount, rowCount)
    {
      var rowsData = [];
      for (var row = 0; row < rowCount; row++) {
        var rowData = [];
        rowData.push(row+1);
        for (var col = 1; col < colCount; col++) {
          rowData.push(Math.random() * 100);
        }
        rowsData.push(rowData);
      }
      return rowsData;
    },
  },

  destruct : function() {
    this._disposeObjects("_table");
  }
});
