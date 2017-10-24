import React from 'react'
import { render } from 'react-dom'
import { Card, Dimmer, Icon, Loader, Button } from 'semantic-ui-react'

class Attachments extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.files != this.props.files;
  }
  render() {
    return(
      <Card.Group>
      {
        this.props.files? this.props.files.map(file => (
          <Attachment
            edit={this.props.edit}
            key={file.name}
            file={file}
            newFile
            deskUrl={this.props.deskUrl}
            docId={this.props.docId}
            onDelete={() => {
              console.log("Requested deletion of " + file.name)
              this.props.onDeleteRequested(file.name)
            }}/>
        )): <div/>
      }
    </Card.Group>
    )
  }
}


class Attachment extends React.Component {
  constructor(props) {
    super(props)
    console.log(this.props)
    this.state = {
      new: this.props.newFile
    }
    if(this.props.newFile) {
      //this.upload(this.props.file)
    }
  }

  upload(file) {
    const reader = new FileReader()
    reader.onload = () => {
      const binString = reader.result
      this.setState({new: false})
      console.log("name was: " + file.name)
    }
    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.readAsBinaryString(file)
  }

  render() {
    return(
      <Card
        fluid={this.props.file.name.length>20? true: false}
        href={this.props.deskUrl + "/" + this.props.docId + "/" +this.props.file.name}
        target="_blank">
        <Card.Content>
          <Card.Header>
            <Icon name="text file outline" />{this.props.file.name}
          </Card.Header>
          <Card.Meta>
            {this.props.file.type}
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          {parseInt(this.props.file.size/1024)} kB
          {
            this.props.edit?
              <Button
                basic
                floated="right" icon="delete" size="mini" onClick={(e) => {
                  this.props.onDelete()
                  e.preventDefault()
                }}/>
            : <div/>
          }
        </Card.Content>
      </Card>
    )
  }
}

export { Attachment, Attachments }
