root = exports ? this

root.toggle = (oInput, input_class)->
  aInputs = document.getElementsByClassName(input_class)
  for input in aInputs
    input.checked = oInput.checked

root.toggleparent = (oInput, parent_class)->
  parents = document.getElementsByClassName(parent_class + ' parent')
  brothers = document.getElementsByClassName(oInput.className)
  check = 0
  uncheck = 0
  for brother in brothers
    if brother.className.indexOf('parent') == -1
      if brother.checked
        check += 1
      else
        uncheck += 1
  for parent in parents
    if check == 0
      parent.checked = false
      parent.indeterminate = false
    else if uncheck == 0
      parent.checked = true
      parent.indeterminate = false
    else
      parent.indeterminate = true
  cousins = document.getElementsByClassName('issues')
  check = 0
  uncheck = 0
  for cousin in cousins
    if cousin.className.indexOf('parent') == -1
      if cousin.checked
        check += 1
      else
        uncheck += 1
  gaia = document.getElementById('gaia')
  if check == 0
    gaia.checked = false
    gaia.indeterminate = false
  else if uncheck == 0
    gaia.checked = true
    gaia.indeterminate = false
  else
    gaia.indeterminate = true

document.addEventListener 'DOMContentLoaded', () ->
  document.getElementById("useless-submit").hidden = true
