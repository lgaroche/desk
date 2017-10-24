
import React from 'react'
import { render } from 'react-dom'
import { Route, Link } from 'react-router-dom'
import { Container, Loader, Dimmer, Button, List,
  Divider, Card, Form, Grid, Table, Header,
  Dropdown, Popup, Label, Menu, Checkbox, Segment,
  Input, Image, Icon } from 'semantic-ui-react'

import { Document } from './Document.js'
import { DocEditor } from './DocEditor.jsx'
import { DocViewer } from './DocViewer.jsx'
import { Finder } from './Finder.jsx'
import { Attachment, Attachments } from './Attachment.jsx'

class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: this.props.selected
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.selected != nextProps.selected) this.setState({
      selected: nextProps.selected
    })
  }

  render() {
    if(this.props.type != "card") {
      return (
        <Route render={({history}) => { return (
          <Table.Row
            positive={this.state.selected}
            style={{cursor: "pointer"}}
            onClick={(e) => {
                if(this.props.selectable) {
                  this.setState({selected: !this.state.selected}, () => {
                    this.props.onSelectionChange(this.state.selected)
                  })
                } else {
                  history.push("/view/" + this.props.doc._id)
                }
            }}>
                {this.props.selectable?
                  <Table.Cell collapsing>
                    <Checkbox checked={this.state.selected}/>
                  </Table.Cell>
                : <Table.Cell collapsing />
                }
                <Table.Cell>
                  <Link
                    onClick={(e)=>{e.preventDefault()}}
                    to={!this.props.selectable? "/view/" + this.props.doc._id: ""}
                    style={{display: 'block', color:'inherit'}}>
                      <Icon name='file text outline' />
                      {this.props.doc.name}
                  </Link>
                </Table.Cell>
                <Table.Cell collapsing>{this.props.doc.date}</Table.Cell>
          </Table.Row>
        )}} />
      )
    } else {
      return(
        <Route render={({history}) => {return(
          <Card
            fluid
            color={this.state.selected? "green": undefined}
            onClick={()=>{
              if(this.props.selectable) {
                this.setState({selected: !this.state.selected},
                  () => {this.props.onSelectionChange(this.state.selected)})
            }
            else {
              history.push("/view/" + this.props.doc._id)
            }
          }}>
            <Card.Content>
              <Card.Header>
                {this.props.doc.name}
              </Card.Header>
              <Card.Meta>
                <List celled horizontal>
                {this.props.doc.tags.map(tag => (
                  <List.Item key={tag}>{tag}</List.Item>
                ))}
                </List>
              </Card.Meta>
              <Card.Description>{this.props.doc.description}</Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Icon name="calendar"/>
              {this.props.doc.date}
            </Card.Content>
          </Card>
        )}} />
      )
    }
  }
}

class Documents extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDocs: [],
      selectAll: false
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.state)
    if(this.props.selectable && !nextProps.selectable) {
      console.log("changing state")
      this.setState({
        selectable: false,
        selectedDocs: [],
        selectAll: false
      })
    }
  }

  render() {
    let filters = this.props.filters
    let docs = []
    if(filters == undefined) {
      docs = this.props.items
    }
    else {
      docs = this.props.items
        .filter(doc => doc.hasTags(filters.tags))
        .filter(doc => doc.hasText(filters.text))
        .filter(doc => doc.isAfter(filters.from))
        .filter(doc => doc.isBefore(filters.to))
    }
    if(!this.props.tableMode) {
      return(
        <Card.Group>
          {
            docs.map(doc => (
              <Item
                key={doc._id}
                type="card"
                doc={doc}
                selectable={this.props.selectable}
                selected={this.state.selectedDocs.indexOf(doc._id) > -1}
                onSelectionChange={(selected) => {
                  if(selected) this.setState({
                    selectedDocs: [...this.state.selectedDocs, doc._id]
                  }, () => {this.props.onSelectionChange(this.state.selectedDocs)})
                  else {
                    let el = this.state.selectedDocs.indexOf(doc._id)
                    if(el > -1) {
                      let newSelectedDocs = [...this.state.selectedDocs]
                      newSelectedDocs.splice(el, 1)
                      this.setState({
                        selectedDocs: newSelectedDocs
                      }, () => {this.props.onSelectionChange(this.state.selectedDocs)})
                    }
                  }
                }} />
            ))
          }
        </Card.Group>
      )
    }
    else return (
      <Table striped selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              { this.props.selectable?
                <Checkbox checked={this.state.selectAll} onChange={()=>{
                  let selection = []
                  if(!this.state.selectAll) {
                    for(let d of docs) {
                      selection.push(d._id)
                    }
                  }
                  this.setState({
                    selectAll: !this.state.selectAll,
                    selectedDocs: selection
                  }, ()=>{this.props.onSelectionChange(this.state.selectedDocs)})
                }}/>: <div/>}
            </Table.HeaderCell>
            <Table.HeaderCell>Document ({docs.length})</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            docs.map(doc => (
              <Item
                key={doc._id}
                doc={doc}
                selectable={this.props.selectable}
                selected={this.state.selectedDocs.indexOf(doc._id) > -1}
                onSelectionChange={(selected) => {
                  if(selected) this.setState({
                    selectedDocs: [...this.state.selectedDocs, doc._id]
                  }, () => {this.props.onSelectionChange(this.state.selectedDocs)})
                  else {
                    let el = this.state.selectedDocs.indexOf(doc._id)
                    if(el > -1) {
                      let newSelectedDocs = [...this.state.selectedDocs]
                      newSelectedDocs.splice(el, 1)
                      this.setState({
                        selectedDocs: newSelectedDocs
                      }, () => {this.props.onSelectionChange(this.state.selectedDocs)})
                    }
                  }
                }} />
            ))
          }
        </Table.Body>
      </Table>
    )
  }
}


export {Documents, DocEditor, Finder, DocViewer}
