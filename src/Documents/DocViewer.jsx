import React from 'react'
import { render } from 'react-dom'
import { Route } from 'react-router-dom'
import { Segment, Button, Header, Label, Divider, Card } from 'semantic-ui-react'

import { Attachment, Attachments } from './Attachment.jsx'

class DocViewer extends React.Component {
  constructor(props) {
    super(props)
    console.log(props.store)
    let doc = props.store.docs.filter(doc => doc._id == this.props.id)[0]
    console.log(doc)
    let tags = []
    try {
      tags = doc.tags.map(tag => { return {key: tag, value: tag}})
    } catch(e) {
      console.log("Cannot parse document tags")
    }
    this.state = {
      id: doc._id,
      name: doc.name,
      date: doc.date,
      tags: tags,
      text: doc.text,
      files: doc.files
    }
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentWillReceiveProps( nextProps) {
    console.log("will receive: " + nextProps)
  }

  render() {
    return(
      <div>
        <Segment basic clearing>
          <Route render={({history}) => (
            <Button.Group floated="right">
              <Button color="blue" icon="edit" content="Edit" onClick={() => {
                history.push("/edit/" + this.state.id)
              }}/>
              <Button icon="close" content="Close" onClick={() => {
                history.goBack()
              }}/>
            </Button.Group>
          )} />
          <Header as="h1" floated="left">
            {this.state.name}
            <Header.Subheader>
              {this.state.date}
            </Header.Subheader>
          </Header>
        </Segment>
        {
          this.state.tags.map(tag => (
            <Label tag key={tag.key}>{tag.value}</Label>
          ))
        }
        <Divider />
        <Attachments
          files={this.state.files}
          docId={this.state.id}
          deskUrl={this.props.store.deskUrl}/>
        <Divider />
        <Segment clearing>
          {this.state.text? this.state.text.split('\r\n').map((item, key) => {
            return <span key={key}>{item}<br/></span>
          }) : <div/>}
        </Segment>
      </div>
    )
  }
}

export { DocViewer }
