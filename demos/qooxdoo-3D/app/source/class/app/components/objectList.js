qx.Class.define("app.components.objectList",
{
  extend: qx.ui.window.Window,

  construct : function(width, height, backgroundColor, fontColor)
  {
    this.base(arguments, "Object List");

    this.set({
      contentPadding: 0,
      width: width,
      height: height,
      allowClose: false,
      allowMinimize: false,
      layout: new qx.ui.layout.VBox(),
      backgroundColor: backgroundColor,
      textColor: fontColor
    });

    var scroller = new qx.ui.container.Scroll();
    this.add(scroller);
    this.setHeight(height-30);

    // create and add the tree
    this._tree = new qx.ui.tree.Tree();
    this._tree.set({
      backgroundColor: backgroundColor,
      textColor: fontColor
    });
    this._tree.setSelectionMode("single");
    this._tree.setWidth(width);
    this._tree.setHeight(height);

    var root = new qx.ui.tree.TreeFolder("root");
    root.setOpen(true);
    this._tree.setRoot(root);

    this._tree.addListener("changeSelection", this._onSelectionChanged.bind(this));

    var remove_button = new qx.ui.form.Button("Remove object");
    remove_button.set({
      width: 100,
      height: 30,
      textColor: 'black'
    });
    remove_button.addListener("execute", this.RemoveObjectPressed.bind(this));

    scroller.add(this._tree);
    this.add(remove_button);
  },

  events : {
    "removeObjectRequested": "qx.event.type.Data",
    "selectionChanged": "qx.event.type.Data",
  },

  members: {
    _currentList: null,
    _tree: null,

    _onSelectionChanged : function(e) {
      if (e.getData()[0].id) {
        this.fireDataEvent("selectionChanged", e.getData()[0].id);
      } else {
        this.fireDataEvent("selectionChanged", null);
      }
    },

    AddObject : function(id, name) {
      var newItem = new qx.ui.tree.TreeFile(name);
      newItem.id = id;
      this._tree.getRoot().add(newItem);
      this._tree.setSelection([newItem]);
    },

    RemoveObject : function(uuid) {
      for (var i = 0; i < this._tree.getRoot().getChildren().length; i++) {
        if (this._tree.getRoot().getChildren()[i].id === uuid) {
          this._tree.getRoot().remove(this._tree.getRoot().getChildren()[i]);
        }
      }
    },

    RemoveObjectPressed : function(uuid) {
      if (this.GetSelectedObjectId()) {
        this.fireDataEvent("removeObjectRequested", this.GetSelectedObjectId());
      }
    },

    OnEntitySelectedChanged : function(uuid) {
      if (uuid === null) {
        this._tree.resetSelection();
      } else {
        for (var i = 0; i < this._tree.getRoot().getChildren().length; i++) {
          if (this._tree.getRoot().getChildren()[i].id === uuid) {
            this._tree.setSelection([this._tree.getRoot().getChildren()[i]]);
          }
        }
      }
    },

    GetSelectedObject : function() {
      if ( this._tree.getSelection().length > 0 ) {
        return this._tree.getSelection()[0];
      }
      return null;
    },

    GetSelectedObjectId : function() {
      if ( this.GetSelectedObject() ) {
        return this.GetSelectedObject().id;
      }
      return null;
    },
  }
});
