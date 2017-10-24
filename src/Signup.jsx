import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom'
import { Grid, Segment, Icon, Dimmer, Loader,
  Header, Form, Input, Button } from 'semantic-ui-react'

import * as MediaQuery from 'react-responsive'
import { DeskStore } from './DeskStore.js'

class Signup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.user? props.user: '',
      password: '',
      email: '',
      password_confirm: '',
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
                  <Loader>Registering user</Loader>
                </Dimmer>
                <Header as="h1" textAlign="center">
                  <Header.Content className="logo-login">Desk</Header.Content>
                </Header>
                {this.props.denied?
                  <Segment inverted color="red">{this.props.error}</Segment>
                  : <div/>
                }
                <Form>
                  <Form.Input value={this.state.user} label='User' required
                    onChange={(e, {value})=>{
                    this.setState({user: value})
                  }}/>
                  <Form.Input value={this.state.email} label='e-mail' required
                    onChange={(e, {value})=>{
                    this.setState({email: value})
                  }}/>
                  <Form.Input value={this.state.password} label='Password'
                    required type="password"
                    onChange={(e, {value})=>{
                    this.setState({password: value})
                  }}/>
                  <Form.Input value={this.state.password_confirm}
                    label='Confirm password' type="password"
                    error={this.state.password !== this.state.password_confirm}
                    required
                    onChange={(e, {value})=>{
                    this.setState({password_confirm: value})
                  }}/>
                  <Route render={({history}) => (
                    <Button fluid color="blue"
                      active={this.state.password === this.state.password_confirm}
                      content="Register" icon="add user" onClick={()=>{
                        if(this.state.password === this.state.password_confirm) {
                          this.setState({loading: true})
                          DeskStore.signup(this.state).then(res=>{
                            if(res.ok) {
                              console.log("Waiting for user creation")
                              setTimeout(() => {
                                this.setState({loading: false})
                                history.push("/", {user: this.state.user})
                              }, 2000)
                            }
                          }).catch(err => {
                            console.log("Cannot sign up")
                            this.setState({loading: false})
                          })
                        } else {

                        }
                    }}/>
                  )} />
                </Form>
              </Dimmer.Dimmable>
            </Grid.Column>
          </Grid>
        )}}
      </MediaQuery>
    )
  }
}

export { Signup }
