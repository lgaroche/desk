import React from 'react'
import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom'

import { Mainmenu } from './Mainmenu.js'
import { Dimmer, Loader, Sidebar} from 'semantic-ui-react'
import { Finder, DocEditor, DocViewer } from './Documents/Documents.jsx'
import { BulkEditor } from './Documents/BulkEditor.jsx'

class DeskApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return(
      <BrowserRouter>
        <div>
          <Mainmenu/>
          <Sidebar.Pusher className="appContent">
            {
              this.props.store && this.props.store.connected?
                <Switch>
                  <Route path="/" exact>
                    <Finder store={this.props.store} initialState={this.state.finderState}
                      onStateChange={(state) => {
                        this.setState({finderState: state})
                        }
                      } />
                  </Route>
                  <Route exact path="/find">
                    <Finder store={this.props.store} initialState={this.state.finderState}
                      onStateChange={(state) => {
                        this.setState({finderState: state})
                        }
                      } />
                  </Route>
                  <Route path="/view/:id" render={(props) => {
                    return(
                      <DocViewer id={props.match.params.id} store={this.props.store} />
                    )
                  }} />
                  <Route path="/edit/:id" render={(props) => {
                    return(
                      <DocEditor id={props.match.params.id} store={this.props.store} />
                    )
                  }} />
                  <Route exact path="/submit">
                    <DocEditor id={-1} store={this.props.store}/>
                  </Route>
                  <Route exact path="/bulk" render={(props) => {
                    console.log(this.props.store.docs)
                    let docs = this.props.store.docs
                      .filter(d => props.location.state.docs.indexOf(d._id) > -1)
                    return(
                      <BulkEditor docs={docs} store={this.props.store}/>
                    )
                  }} />
                  <Route exact path="/logout" render={(props) => {
                    this.props.store.logout().then(() => {
                      this.props.onLogout()
                    })
                    return(<Redirect to="/"/>)
                  }} />
                  <Redirect to="/"/>
                </Switch>
              : <Dimmer active>
                <Loader>Loading documents</Loader>
              </Dimmer>
            }
          </Sidebar.Pusher>
        </div>
      </BrowserRouter>
    )
  }
}

export { DeskApp }
