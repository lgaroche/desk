import React from 'react'
import { render } from 'react-dom'
import { Route } from 'react-router-dom'
import { Form, Button, Header, Input, Dropdown, List, Icon, TextArea,
  Modal, Divider } from 'semantic-ui-react'

import * as Dropzone from 'react-dropzone'

import { Document } from './Document.js'
import { Attachment, Attachments } from './Attachment.jsx'
import { YEARS, MONTHS, DAYS } from './DateUtils.js'

class DocEditor extends React.Component {
  constructor(props) {
    super(props)
    if(props.id == -1) {
      console.log("New document")
      let date = new Date()
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      let d = date.getDate()
      console.log(this.props.store)
      this.state = {
        tagOptions: this.props.store.tags,
        saving: false,
        tags: [],
        name: "New document",
        year: y,
        month: m<10 ? "0"+m: m,
        day: d<10? "0"+d: d,
        files: []
      }
    } else {
      let doc = this.props.store.docs.filter(doc => doc._id == this.props.id)[0]
      let [y, m, d] = ""
      if(doc.date != undefined) {
        y = parseInt(doc.date.split("-")[0])
        m = parseInt(doc.date.split("-")[1])
        d = parseInt(doc.date.split("-")[2])
      }
      this.state = {
        doc: doc,
        saving: false,
        tagOptions: this.props.store.tags,
        id: doc._id,
        name: doc.name,
        year: y,
        month: m<10? "0" + m: m,
        day: d<10? "0" + d: d,
        tags: doc.tags,
        text: doc.text,
        files: doc.files
      }
    }
  }

  render() {
    //let tags = this.state.tags.map(tag => {return {key: tag, value: tag, text: tag}})
    const selected = this.state.tags
    return(
      <div style={{maxWidth: '730px'}}>
        <Form>
          <Route render={({history}) => (
            <Button.Group floated="right">
              <Button
                color="green"
                loading={this.state.saving}
                icon="save"
                content="Save"
                onClick={() => {
                  if(this.state.saving) return
                  this.setState({saving: true})
                  let date = this.state.year + "-" + this.state.month + "-" + this.state.day
                  if(this.props.id == -1) { /* New document */
                    this.props.store.create(new Document(
                      this.state.name, this.state.tags, date, this.state.text, this.state.files))
                      .then(res => {
                        console.log(res)
                        history.push("/view/"+res.id)
                      })
                  } else { /* Update document */
                    let doc = {
                      _id: this.state.doc._id,
                      _rev: this.state.doc._rev,
                      _attachments: this.state.doc._attachments,
                      name: this.state.name,
                      date: date,
                      tags: this.state.tags,
                      text: this.state.text,
                      createdAt: this.state.doc.createdAt,
                      modifiedAt: new Date(),
                      files: this.state.files
                    }
                    //let newAttachments = this.state.files.filter(file => file.isNew == true)
                    //let deletedAttachments = []
                    this.props.store.update(doc).then(res => {
                      history.push("/view/"+res._id)
                    })
                }
                //history.push("/view/" + this.state.doc._id)
              }}/>
              <Button color="red" icon="trash" content="Delete" onClick={() => {
                console.log(this.state)
                this.props.store.delete(this.state.doc).then(res => {
                  history.push("/")
                })
              }}/>
              <Button content="Cancel" icon="cancel" onClick={() => {
                history.push("/view/"+this.state.doc._id)
              }}/>
            </Button.Group>
          )} />
          <Header as="h1" floated="left">{this.state.name}</Header>
          <Form.Field>
            <Input label="Name" value={this.state.name} onChange={(e, data) => {
              this.setState({name: data.value, files:this.state.files})
            }}/>
          </Form.Field>
          <Form.Field>
            <Dropdown placeholder="Year"
              button options={YEARS}
              value={this.state.year}
              onChange={(e, {value}) => {this.setState({year: value})}}
            />
            <Dropdown placeholder="Month"
              button options={MONTHS}
              value={this.state.month}
              onChange={(e, {value}) => {this.setState({month: value})}}
            />
            <Dropdown placeholder="Day"
              button options={DAYS}
              value={this.state.day}
              onChange={(e, {value}) => {this.setState({day: value})}}
            />
          </Form.Field>

          <Form.Field>
              <Dropdown
                placeholder="Tags"
                autoComplete="false"
                fluid multiple search selection allowAdditions
                options={this.state.tagOptions}
                value={selected}
                onAddItem={(e, {value}) => {
                  this.setState({
                    tagOptions: [{text: value, value}, ...this.state.tagOptions],
                  })
                }}
                onChange={(e, {value}) => {
                  this.setState({tags: value})
                }} />
          </Form.Field>
        </Form>
        <Divider hidden />
        <Attachments
          files={this.state.files}
          deskUrl={this.props.store.deskUrl}
          edit
          onDeleteRequested={(name)=>{
          let files = [...this.state.files]
          let fileToDelete = files.findIndex(i => i.name == name)
          files.splice(fileToDelete, 1)
          this.setState({files: files})
        }}/>
        <Divider hidden />
        <Dropzone
          style={{border: 'none'}}
          onDrop={(files, event) => {
            let f = []
            let ignored = []
            files.forEach(file => {
              file.isNew = true
              if(this.state.files.findIndex(i => i.name == file.name) > -1 ||
                f.findIndex(i => i.name == file.name) > -1) {
                  console.log("Ignore duplicate file " + file.name)
                  ignored.push(file.name)
                  return
                }
              f.push(file)
              console.log("added " + file.name)
            })
            if(ignored.length == 0) ignored = false
            this.setState({
              files: [...f, ...this.state.files],
              ignoredFiles: ignored
            }, () => {console.log(this.state.files)})
          }}>
          <Modal
            basic
            trigger={<Button icon="add" content="Drop files here or click to add" />}
            open={this.state.ignoredFiles? true: false}
            onClose={() => {this.setState({ignoredFiles: false})}}
          >
            <Header as={"h1"}>Duplicate names found:</Header>
            <Modal.Content>
              <List>
            {
              this.state.ignoredFiles? this.state.ignoredFiles.map(file => (
                <List.Item key={file}>
                  <List.Icon name="file outline" />
                  <List.Content>{file}</List.Content>
                </List.Item>
              )) : <div/>
            }
              </List>
            </Modal.Content>
            <Modal.Actions>
              <Button color='green' inverted
                onClick={()=>{
                  this.setState({ignoredFiles: false})
                }}>
                <Icon name='checkmark' /> Ok
              </Button>
            </Modal.Actions>
          </Modal>
        </Dropzone>
        <Divider />
        <Form>
          <TextArea autoHeight placeholder="Text content"
            value={this.state.text}
            onChange={(e, {value})=>{
            this.setState({text: value})
          }}/>
        </Form>
      </div>
    )
  }
}

export { DocEditor }
