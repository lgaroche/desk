import React from 'react'
import { render } from 'react-dom'
import { Route } from 'react-router-dom'
import { Header, Divider, Form, Menu, Label, Icon, Grid,
  Dropdown, Checkbox, Input } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const MediaQuery = require('react-responsive')

import { Documents } from './Documents.jsx'
import { YEARS, MONTHS, DAYS } from './DateUtils.js'

class Finder extends React.Component {
  constructor(props) {
    super(props)
    if(this.props.initialState != null) {
      this.state = this.props.initialState
    }
    else {
      var docs = [...this.props.store.docs]
      docs.sort((a,b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
      if(docs.length > 0) {
        var [firsty, firstm, firstd] = docs[0].date.split("-")
        var [lasty, lastm, lastd] = docs[docs.length-1].date.split("-")
      }
      this.state = {
        store: this.props.store,
        tableMode: false,
        tagFilter: [],
        textFilter: [],
        toMonthFilter: lastm,
        toYearFilter: lasty,
        fromMonthFilter: firstm,
        fromYearFilter: firsty,
        selectedDocs: []
      }
    }
  }

  render() {
    let tagFilter = this.state.tagFilter
    let textFilter = this.state.textFilter
    let fromFilter = {
      month: this.state.fromMonthFilter,
      year: this.state.fromYearFilter
    }
    let toFilter = {
      month: this.state.toMonthFilter,
      year: this.state.toYearFilter
    }
    if(!this.props.store) return(<div/>)
    let docs = this.state.store.docs
    let tags = this.state.store.tags? this.state.store.tags: []
    let filteredTags = []
    let years = []
    let pushed = []
    for(let doc of docs) {
      try {
        let y = doc.date.split("-")[0]
        if(pushed.indexOf(y) < 0) {
          years.push({
            key: y,
            value: y,
            text: y
          })
          pushed.push(y)
        }
        years.sort((a,b) => {return a.value - b.value})
      } catch(e) {
        console.log("Error with [" + doc._id + "]: " + e)
      }
    }
    for(let tag of tags) {
      let copy = tagFilter.slice()
      copy.push(tag.key)
      let d = docs
        .filter(d => d.hasTags(copy))
        .filter(d => d.hasText(textFilter))
        .filter(d => d.isAfter(fromFilter))
        .filter(d => d.isBefore(toFilter))
      tag.description = d.length + ' documents'
      if(d.length > 0) {
        filteredTags.push(tag)
      }
    }

    return(
      <div style={{maxWidth: "730px"}}>
        <Header as="h1">Find documents</Header>
        <Divider/>
        <Form>
          <Form.Field>
            <Input icon='search' value={this.state.textFilter}
              placeholder='Search' onChange={(event, data) => {
              this.setState({
                textFilter: data.value
              }, () => {this.props.onStateChange(this.state)})
            }}/>
          </Form.Field>
          <Form.Field>
            <Dropdown
              placeholder="Filter by tag"
              fluid multiple search selection closeOnChange
              values={this.state.tagFilter}
              defaultValue={this.state.tagFilter}
              options={filteredTags}
              onChange={(event, data) => {
                this.setState({
                  tagFilter: data.value
                }, () => {this.props.onStateChange(this.state)})
              }}
            />
          </Form.Field>
          <Form.Field>
            <Form.Group inline widths={8}>
              <label>Between</label>
              <Dropdown label="From" placeholder="Month"
                button options={MONTHS}
                defaultValue={this.state.fromMonthFilter}
                onChange={(event, data) => {
                    this.setState({
                      fromMonthFilter: data.value
                    }, () => {this.props.onStateChange(this.state)})
                }}
              />
              <Dropdown label="From" placeholder="Year"
                button options={years}
                defaultValue={this.state.fromYearFilter}
                onChange={(event, data) => {
                    this.setState({
                      fromYearFilter: data.value
                    }, () => {this.props.onStateChange(this.state)})
                }}
              />
            </Form.Group>
            <Form.Group inline>
              <label>&nbsp;&nbsp;And</label>
              <Dropdown label="To" placeholder="Month"
                button options={MONTHS}
                defaultValue={this.state.toMonthFilter}
                onChange={(event, data) => {
                    this.setState({
                      toMonthFilter: data.value
                    }, () => {this.props.onStateChange(this.state)})
                }}
              />
              <Dropdown label="To" placeholder="Year"
                button options={years}
                defaultValue={this.state.toYearFilter}
                onChange={(event, data) => {
                    this.setState({
                      toYearFilter: data.value
                    }, () => {this.props.onStateChange(this.state)})
                }}
              />
            </Form.Group>
          </Form.Field>
            <MediaQuery minWidth={760}>
              {(match) => {
                if(match) {
                  return(
                    <Form.Field>
                      <Checkbox toggle label="Table" checked={this.state.tableMode}
                        onChange={(event, data) => {
                            this.setState({
                              tableMode: !this.state.tableMode
                            }, () => {this.props.onStateChange(this.state)})
                        }}/>
                    </Form.Field>
                  )
                } else { return(<div/>)}}}
            </MediaQuery>
          <Form.Field>
            <Checkbox toggle label="Select" checked={this.state.selectable}
              onChange={(event, data) => {
                  this.setState({
                    selectable: !this.state.selectable
                  })
              }}/>
          </Form.Field>
        </Form>
        <Divider/>
        {
          this.state.selectable?
            <MediaQuery maxWidth={760}>
              {(match) => {
                return(
                  <Menu vertical={match}>
                    <Menu.Item>
                      <Label
                        content={this.state.selectedDocs.length + " docs"}
                        color="blue"
                        circular />
                    </Menu.Item>
                    <Menu.Item icon="download" content="Download" />
                    <Menu.Item onClick={() => {
                      console.log(this)
                    }}>
                      <Icon name="mail" />
                      Send
                    </Menu.Item>
                    <Menu.Item onClick={() => {
                      let docsToDelete = this.props.store.docs
                        .filter(doc => this.state.selectedDocs.indexOf(doc._id) > -1)
                      this.props.store.deleteBulk(docsToDelete).then(res => {
                        this.setState({selectedDocs: []})
                      })
                    }}>
                      <Icon name="trash" />
                      Delete
                    </Menu.Item>
                    <Route render={({history}) => (
                      <Menu.Item onClick={() => {
                        console.log("Bulk editor")
                        history.push("/bulk", {docs: this.state.selectedDocs})
                      }}>
                        <Icon name="edit" />
                        Edit
                      </Menu.Item>
                    )} />
                  </Menu>
                )
              }}
            </MediaQuery>
          : <div/>
        }
        <MediaQuery minWidth={760}>
          {(match) => {
            return(
              <Documents
                onSelectionChange={(selected) => {
                  this.setState({selectedDocs: selected})
                }}
                selectable={this.state.selectable}
                items={docs}
                tableMode={match && this.state.tableMode}
                filters={{
                  from: fromFilter,
                  to: toFilter,
                  tags: tagFilter,
                  text: textFilter
                }} />
            )
          }}
        </MediaQuery>
      </div>
    )
  }
}

export { Finder }
