(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.toggle = function(oInput, input_class) {
    var aInputs, i, input, len, results;
    aInputs = document.getElementsByClassName(input_class);
    results = [];
    for (i = 0, len = aInputs.length; i < len; i++) {
      input = aInputs[i];
      results.push(input.checked = oInput.checked);
    }
    return results;
  };

  root.toggleparent = function(oInput, parent_class) {
    var brother, brothers, check, cousin, cousins, gaia, i, j, k, len, len1, len2, parent, parents, uncheck;
    parents = document.getElementsByClassName(parent_class + ' parent');
    brothers = document.getElementsByClassName(oInput.className);
    check = 0;
    uncheck = 0;
    for (i = 0, len = brothers.length; i < len; i++) {
      brother = brothers[i];
      if (brother.className.indexOf('parent') === -1) {
        if (brother.checked) {
          check += 1;
        } else {
          uncheck += 1;
        }
      }
    }
    for (j = 0, len1 = parents.length; j < len1; j++) {
      parent = parents[j];
      if (check === 0) {
        parent.checked = false;
        parent.indeterminate = false;
      } else if (uncheck === 0) {
        parent.checked = true;
        parent.indeterminate = false;
      } else {
        parent.indeterminate = true;
      }
    }
    cousins = document.getElementsByClassName('issues');
    check = 0;
    uncheck = 0;
    for (k = 0, len2 = cousins.length; k < len2; k++) {
      cousin = cousins[k];
      if (cousin.className.indexOf('parent') === -1) {
        if (cousin.checked) {
          check += 1;
        } else {
          uncheck += 1;
        }
      }
    }
    gaia = document.getElementById('gaia');
    if (check === 0) {
      gaia.checked = false;
      return gaia.indeterminate = false;
    } else if (uncheck === 0) {
      gaia.checked = true;
      return gaia.indeterminate = false;
    } else {
      return gaia.indeterminate = true;
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    return document.getElementById("useless-submit").hidden = true;
  });

}).call(this);
