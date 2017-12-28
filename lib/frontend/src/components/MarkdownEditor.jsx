import './MarkdownEditor.sass'
import 'draft-js/dist/Draft.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import React from 'react'
import { convertToRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import draftToMarkdown from 'draftjs-to-markdown'

import { block } from '../utils'

const b = block('MarkdownEditor')

export default class MarkdownEditor extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      editorState: '',
    }
  }

  handleEditorStateChange(editorState) {
    this.setState({
      editorState,
    })
  }

  render() {
    const { editorState } = this.state
    return (
      <div className={b()}>
        <Editor
          wrapperClassName={b('wrapper')}
          editorClassName={b('editor')}
          toolbarClassName={b('toolbar')}
          onEditorStateChange={state => this.handleEditorStateChange(state)}
        />
        <textarea
          id="body"
          name="body"
          hidden
          disabled
          value={
            editorState &&
            draftToMarkdown(convertToRaw(editorState.getCurrentContent()))
          }
        />
      </div>
    )
  }
}
