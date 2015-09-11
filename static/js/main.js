(function() {
  var toggle;

  toggle = function() {
    var aInputs, i, input, len, oInputs, results;
    aInputs = document.getElementsByName('issues');
    oInputs = document.getElementById('chk_all');
    results = [];
    for (i = 0, len = aInputs.length; i < len; i++) {
      input = aInputs[i];
      results.push(input.checked = oInputs.checked);
    }
    return results;
  };

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("useless-submit").hidden = true;
    return document.getElementById("chk_all").onclick = toggle;
  });

}).call(this);
