toggle = ()->
  aInputs = document.getElementsByName('issues')
  oInputs = document.getElementById('chk_all')
  for input in aInputs
    input.checked = oInputs.checked

document.addEventListener 'DOMContentLoaded', () ->
  document.getElementById("useless-submit").hidden = true
  document.getElementById("chk_all").onclick = toggle
