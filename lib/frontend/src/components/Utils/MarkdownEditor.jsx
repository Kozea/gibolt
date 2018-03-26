import 'draft-js/dist/Draft.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import './MarkdownEditor.sass'

import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter'
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'

import { updateMeetingContent } from '../../actions/meetings'
import { block, connect } from '../../utils'

const b = block('MarkdownEditor')
const myMdDict = {
  UNDERLINE: '__',
  CODE: '```',
}

class MarkdownEditor extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      editorState: EditorState.createWithContent(
        convertFromRaw(
          mdToDraftjs(this.props.initValue ? this.props.initValue : '')
        )
      ),
    }
  }

  handleEditorStateChange(editorState) {
    this.setState({
      editorState,
    })
    if (this.props.useStore) {
      // for meeting report creation/edition only
      // in other cases, useStore is not defined
      this.props.onContentChange(
        draftjsToMd(convertToRaw(editorState.getCurrentContent()), myMdDict)
      )
    }
    if (this.props.setTimer) {
      // for meeting report creation/edition only
      // in other cases, setTimer is not defined
      this.props.setTimer()
    }
  }

  render() {
    const { editorState } = this.state
    const editorName = this.props.editorName ? this.props.editorName : 'body'
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
              'image',
              'emoji',
              'history',
            ],
            image: { alignmentEnabled: false },
            inline: {
              options: ['bold', 'italic', 'monospace'],
            },
            list: {
              options: ['unordered', 'ordered'],
            },
          }}
        />
        <textarea
          id={editorName}
          name={editorName}
          hidden
          disabled
          value={
            editorState &&
            draftjsToMd(convertToRaw(editorState.getCurrentContent()), myMdDict)
          }
        />
      </div>
    )
  }
}

export default connect(
  () => ({}),
  dispatch => ({
    onContentChange: value => {
      dispatch(updateMeetingContent(value))
    },
  })
)(MarkdownEditor)
