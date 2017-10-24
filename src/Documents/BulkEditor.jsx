import React from 'react'
import { render } from 'react-dom'
import { Route } from 'react-router-dom'
import { Header, Dropdown, Divider, Form, Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import { Documents } from './Documents.jsx'

class BulkEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tagOptions: this.props.store.tags,
      tags: []
    }
  }

  render() {
    if(!this.props.docs) return(<div/>)
    return (
      <div>
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
                  let updates = []
                  for(let doc of this.props.docs) {
                    doc.tags = this.state.tags
                    updates.push(this.props.store.update(doc))
                  }
                  Promise.all(updates).then(res => {
                    console.log(res)
                    history.push("/find")
                  }).catch(err => {
                    console.log("Error updating docs")
                    this.setState({saving: false})
                  })
                  /*this.props.store.update(doc).then(res => {
                    history.push("/view/"+res._id)
                  })*/
                }}/>
              <Button
                icon="cancel"
                content="Cancel"
                onClick={() => {
                  history.goBack()
                }}/>
            </Button.Group>
          )} />
          <Header as="h1" floated="left">Set tags</Header>
          <Form.Field>
              <Dropdown
                placeholder="Tags"
                fluid multiple search selection allowAdditions
                options={this.state.tagOptions}
                value={this.state.tags}
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
        <Divider />
        <Documents tableMode={true} items={this.props.docs} />
      </div>
    )
  }

}

export { BulkEditor }
