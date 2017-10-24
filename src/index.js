import React from 'react'
import { render } from 'react-dom'

import { Login } from './Login.jsx'
import { DeskApp } from './DeskApp.jsx'
import { DeskStore } from './DeskStore.js'
import { Signup } from './Signup.jsx'

import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'



import 'semantic-ui-css/semantic.css'
import 'style.css'

const MOUNT_NODE = document.getElementById('root')


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
      denied: false
    }
  }

  render() {
    if(!this.state.loggedIn) {
      return(
        <BrowserRouter>
          <Switch>
            <Route path="/signup" render={(props) => (
              <Signup user={props.location.state? props.location.state.user: ''}
                onRegister={(state) => {

                }}/>
            )}/>
            <Route render={(props) => {
              console.log(props)
              return(
              <Login
                default={props.location.state? props.location.state.user: ''}
                denied={this.state.denied}
                error={this.state.error}
                onLogin={(user, password) => {
                  new DeskStore(user, password).then(res => {
                    this.setState({denied: false, loggedIn: true, store: res})
                  }).catch(err => {
                    if(err.error == 'unauthorized') this.setState({denied: true, error: err.message})
                    console.log(err)
                  })
                }}
                onRegister={(user) => {
                  if(!user) user = ''
                  props.history.push("/signup", {user: user})
                }}/>
            )}} />
            </Switch>
          </BrowserRouter>
      )
    }
    else {
      return(
        <DeskApp store={this.state.store} onLogout={()=>{
          this.setState({loggedIn: false})
        }}/>
      )
    }
  }
}

render(<App />, MOUNT_NODE)
let docs = []
