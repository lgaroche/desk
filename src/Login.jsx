import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom'
import { Grid, Segment, Icon, Dimmer, Loader,
  Header, Form, Input, Button } from 'semantic-ui-react'

import * as MediaQuery from 'react-responsive'
import { Document } from './Documents/Document.js'
import { Mainmenu } from './Mainmenu.js'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.default? props.default: '',
      password: '',
      loading: false
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    this.setState({loading: false})
  }

  render() {
    return(
      <MediaQuery minWidth={700}>
        {(match) => { return(
          <Grid centered columns={match? "2": "1"} padded>
            <Grid.Column style={{maxWidth: "400px"}}>
              <Dimmer.Dimmable dimmed={this.state.loading}>
                <Dimmer active={this.state.loading} inverted>
                  <Loader></Loader>
                </Dimmer>
                <Header as="h1" textAlign="center">
                  <Header.Content className="logo-login">Desk</Header.Content>
                </Header>
                {this.props.denied?
                  <Segment inverted color="red">{this.props.error}</Segment>
                  : <div/>
                }
                <Form>
                  <Form.Input value={this.state.user}
                    label='User' onChange={(e, {value})=>{
                    this.setState({user: value})
                  }}/>
                  <Form.Input value={this.state.password}
                    label='Password' type="password" onChange={(e, {value})=>{
                    this.setState({password: value})
                  }}/>
                  <Button.Group fluid>
                    <Button color="blue" content="Login" icon="privacy" onClick={()=>{
                      this.setState({loading: true})
                      this.props.onLogin(this.state.user, this.state.password)
                    }}/>
                    <Button content="Register"
                      icon="add user" onClick={()=>{
                      this.props.onRegister(this.state.user)
                    }}/>
                  </Button.Group>
                </Form>
              </Dimmer.Dimmable>
            </Grid.Column>
          </Grid>
        )}}
      </MediaQuery>
    )
  }
}

export { Login }
