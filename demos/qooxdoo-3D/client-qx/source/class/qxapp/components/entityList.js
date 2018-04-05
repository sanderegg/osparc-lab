qx.Class.define("qxapp.components.entityList",
{
  extend: qx.ui.window.Window,

  include : [qx.locale.MTranslation],

  construct : function(width, height, backgroundColor, fontColor)
  {
    this.base(arguments, this.tr("Entity List"));

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
    this._tree.setSelectionMode("multi");
    this._tree.setWidth(width);
    this._tree.setHeight(height);

    var root = new qx.ui.tree.TreeFolder("Model");
    root.setOpen(true);
    this._tree.setRoot(root);

    this._tree.addListener("changeSelection", this._onSelectionChanged.bind(this));

    var remove_button = new qx.ui.form.Button(this.tr("Remove entity"));
    remove_button.set({
      width: 100,
      height: 30,
      textColor: 'black'
    });
    remove_button.addListener("execute", this._removeEntityPressed.bind(this));

    scroller.add(this._tree);
    this.add(remove_button);
  },

  events : {
    "removeEntityRequested": "qx.event.type.Data",
    "selectionChanged": "qx.event.type.Data",
    "visibilityChanged": "qx.event.type.Data",
  },

  members: {
    _currentList: null,
    _tree: null,

    _onSelectionChanged : function(e) {
      var selected_ids = [];
      for (var i = 0; i < e.getData().length; i++) {
        selected_ids.push(e.getData()[i].id);
      }
      this.fireDataEvent("selectionChanged", selected_ids);
    },

    _removeEntityPressed : function() {
      var selectedIds = this.GetSelectedEntityIds();
      for (var i = 0; i < selectedIds.length; i++) {
        this.fireDataEvent("removeEntityRequested", selectedIds[i]);
      }
    },

    _getSelectedEntities : function() {
      return this._tree.getSelection();
    },

    GetSelectedEntityId : function() {
      if ( this._getSelectedEntities().length > 0 ) {
        return this._getSelectedEntities()[0].id;
      }
      return null;
    },

    GetSelectedEntityIds : function() {
      var selectedIds = [];
      for (var i = 0; i < this._getSelectedEntities().length; i++) {
        selectedIds.push(this._getSelectedEntities()[i].id);
      }
      return selectedIds;
    },

    AddEntity : function(id, name) {
      var newItem = new qx.ui.tree.TreeFile();

      // A checkbox comes right after the tree icon
      var checkbox = new qx.ui.form.CheckBox();
      checkbox.setFocusable(false);
      checkbox.setValue(true);
      newItem.addWidget(checkbox);
      var that = this;
      checkbox.addListener("changeValue",
        function(e) {
          that.fireDataEvent("visibilityChanged", [id, e.getData()]);
        }, that);
      
      newItem.addLabel(name);

      newItem.id = id;
      this._tree.getRoot().add(newItem);
      this._tree.setSelection([newItem]);
    },

    RemoveEntity : function(uuid) {
      for (var i = 0; i < this._tree.getRoot().getChildren().length; i++) {
        if (this._tree.getRoot().getChildren()[i].id === uuid) {
          this._tree.getRoot().remove(this._tree.getRoot().getChildren()[i]);
        }
      }
    },

    OnEntitySelectedChanged : function(uuids) {
      if (uuids === null) {
        this._tree.resetSelection();
      } else {
        var selected = [];
        for (var i = 0; i < this._tree.getRoot().getChildren().length; i++) {
          if (uuids.indexOf(this._tree.getRoot().getChildren()[i].id) >= 0 ) {
            selected.push(this._tree.getRoot().getChildren()[i]);
          }
        }
        this._tree.setSelection(selected);
      }
    },
  }
});
