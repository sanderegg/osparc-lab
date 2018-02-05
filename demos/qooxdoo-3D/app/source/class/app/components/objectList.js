qx.Class.define("app.components.objectList",
{
  extend: qx.ui.window.Window,

  construct : function(left, top, width, height)
  {
    this.base(arguments, "Object List");

    this.set({
      contentPadding: 0,
      width: width,
      height: height,
      allowClose: false,
      allowMinimize: false,
      //layout: new qx.ui.layout.Grow()
      layout: new qx.ui.layout.VBox()
    });

    var scroller = new qx.ui.container.Scroll();
    this.add(scroller);
    this.setHeight(height-30);


    // create and add the tree
    this._tree = new qx.ui.tree.Tree();
    this._tree.setSelectionMode("single");
    this._tree.setWidth(width);
    this._tree.setHeight(height);

    var root = new qx.ui.tree.TreeFolder("root");
    root.setOpen(true);
    this._tree.setRoot(root);

    var remove_button = new qx.ui.form.Button("Remove object");
    remove_button.setWidth(100);
    remove_button.setHeight(30);
    remove_button.addListener("execute", this.RemoveObject.bind(this));

    scroller.add(this._tree);
    this.add(remove_button);

    this.moveTo(left, top);
  },

  members: {
    _currentList: null,
    _tree: null,

    AddObject : function(id, name) {
      var newItem = new qx.ui.tree.TreeFile(name);
      newItem.id = id;
      this._tree.getRoot().add(newItem);
    },

    RemoveObject : function() {
      console.log(this._tree.getSelection()[0].id);
    }
  }
});
