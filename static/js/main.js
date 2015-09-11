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

  document.addEventListener('DOMContentLoaded', function() {
    return document.getElementById("useless-submit").hidden = true;
  });

}).call(this);
