root = exports ? this

root.toggle = (oInput, input_class)->
  aInputs = document.getElementsByClassName(input_class)
  for input in aInputs
    input.checked = oInput.checked

document.addEventListener 'DOMContentLoaded', () ->
  document.getElementById("useless-submit").hidden = true
