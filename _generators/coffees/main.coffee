root = exports ? this

root.toggle = (oInput, input_class)->
  aInputs = document.getElementsByClassName(input_class)
  for input in aInputs
    input.checked = oInput.checked
  cousins = document.getElementsByClassName('issues')
  gaia = document.getElementById('gaia')
  setState(cousins, gaia)

root.toggleparent = (oInput, parent_class)->
  parents = document.getElementsByClassName(parent_class + ' parent')
  brothers = document.getElementsByClassName(oInput.className)
  for parent in parents
    setState(brothers, parent)

  cousins = document.getElementsByClassName('issues')
  gaia = document.getElementById('gaia')
  setState(cousins, gaia)



setState = (boxes, parent)->
  state = 'none'
  for box in boxes
    if box.className.indexOf('parent') == -1
      if box.checked
        if state == 'unchecked'
          parent.indeterminate = true
          return 'indeterminate'
        else
          parent.checked = true
          parent.indeterminate = false
          state = 'checked'
      else
        if state == 'checked'
          parent.indeterminate = true
          return 'indeterminate'
        else
          parent.checked = false
          parent.indeterminate = false
          state = 'unchecked'
  return state


root.submit_forms = ()->
    window.location.href = "/issues?"+$("#issue_filter_1").serialize()+"&"+$("#issue_filter_2").serialize()
