(function() {
  var root, setState;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.toggle = function(oInput, input_class) {
    var aInputs, cousins, gaia, i, input, len;
    aInputs = document.getElementsByClassName(input_class);
    for (i = 0, len = aInputs.length; i < len; i++) {
      input = aInputs[i];
      input.checked = oInput.checked;
    }
    cousins = document.getElementsByClassName('issues');
    gaia = document.getElementById('gaia');
    return setState(cousins, gaia);
  };

  root.toggleparent = function(oInput, parent_class) {
    var brothers, cousins, gaia, i, len, parent, parents;
    parents = document.getElementsByClassName(parent_class + ' parent');
    brothers = document.getElementsByClassName(oInput.className);
    for (i = 0, len = parents.length; i < len; i++) {
      parent = parents[i];
      setState(brothers, parent);
    }
    cousins = document.getElementsByClassName('issues');
    gaia = document.getElementById('gaia');
    return setState(cousins, gaia);
  };

  setState = function(boxes, parent) {
    var box, i, len, state;
    state = 'none';
    for (i = 0, len = boxes.length; i < len; i++) {
      box = boxes[i];
      if (box.className.indexOf('parent') === -1) {
        if (box.checked) {
          if (state === 'unchecked') {
            parent.indeterminate = true;
            return 'indeterminate';
          } else {
            parent.checked = true;
            parent.indeterminate = false;
            state = 'checked';
          }
        } else {
          if (state === 'checked') {
            parent.indeterminate = true;
            return 'indeterminate';
          } else {
            parent.checked = false;
            parent.indeterminate = false;
            state = 'unchecked';
          }
        }
      }
    }
    return state;
  };

  root.submit_forms = function() {
    return window.location.href = "/issues?" + $("#issue_filter_1").serialize() + "&" + $("#issue_filter_2").serialize();
  };

}).call(this);
