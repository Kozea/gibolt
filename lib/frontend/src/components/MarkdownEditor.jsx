import 'draft-js/dist/Draft.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import './MarkdownEditor.sass'

import { convertToRaw, EditorState } from 'draft-js'
import { stateFromMarkdown } from 'draft-js-import-markdown'
import draftToMarkdown from 'draftjs-to-markdown'
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'

import { block, connect } from '../utils'

const b = block('MarkdownEditor')

class MarkdownEditor extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      editorState: EditorState.createWithContent(
        stateFromMarkdown(this.props.markvalue)
      ),
      markvalue: this.props.markvalue,
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
          editorState={editorState}
          wrapperClassName={b('wrapper')}
          editorClassName={b('editor')}
          toolbarClassName={b('toolbar')}
          onEditorStateChange={state => this.handleEditorStateChange(state)}
          toolbar={{
            options: [
              'inline',
              'blockType',
              'list',
              'link',
              'emoji',
              'history',
            ],
            inline: {
              options: ['bold', 'italic', 'underline', 'monospace'],
            },
            list: {
              options: ['unordered', 'ordered'],
            },
          }}
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

export default connect(state => ({
  markvalue: state.markvalue,
}))(MarkdownEditor)
