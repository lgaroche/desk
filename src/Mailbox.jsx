import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Link, Route, Switch, Redirect } from 'react-router-dom'

//const ImapClient = require('imports-loader?define=false!emailjs-imap-client')
//import * as ImapClient from 'emailjs-imap-client'
import * as Mail from 'node-poplib-gowhich'

class Mailbox extends React.Component {
  constructor(props) {
    super(props)
    let mail = new Mail({
      hostname: '',
      port: 995,
      tls: true,
      mailparser: true,
      username: '',
      password: ''
    })
    mail.connect(()=>{
      console.log('connected')
    })
  }

  render() {
    return(
      <div/>
    )
  }
}

export { Mailbox }
