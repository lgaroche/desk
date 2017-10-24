const Mailbox = require('./Mailbox.js')
const PouchDB = require('pouchdb')
//const PouchDBAuth = require('pouchdb-authentication')

/*mail.list().then(res => {
  console.log(res)
})*/

//PouchDB.plugin(PouchDBAuth)
const db = new PouchDB('http://localhost:5984/userdb-xxxx', {
  ajax: {
    headers: {
      Authorization: 'Basic ' + Buffer.from('user:password').toString('base64')
    },
    body: {
      name: '',
      password: ''
    }
  }
})


const config = {
  imap: {
    user: '',
    password: '',
    host: '',
    port: 993,
    tls: true,
    authTimeout: 3000
  }
}

const mailbox = new Mailbox(config)

db.info().then(res=>{
  mailbox.connect(count => {
     console.log(count + " new mail arrived")
     mailbox.fetchNewMails().then(res=>{
       console.log("fetched " + res.length + "mails")
       res.forEach(mail => {
         var date = new Date(mail.date)
         var y = date.getFullYear()
         var m = parseInt(date.getMonth()+1)
         var d = date.getDate()
         m = m<10?"0"+m:m
         d = d<10?"0"+d:d
         console.log("Posting " + mail.subject)
         var _attachments = {}
         mail.attachments.forEach(a => {
           _attachments[a.name] = a
         })
         db.post({
           name: mail.subject,
           type: "document",
           tags: ['mail'],
           date: y+"-"+m+"-"+d,
           createdAt: new Date(),
           modifiedAt: new Date(),
           text: mail.text,
           _attachments: _attachments
         }).then(res=>{
           console.log("Added " + mail.subject + " to database")
           mailbox.markAsSeen([mail.uid]).then(() => {
             console.log("Mail " + mail.uid + " marked as seen")
           }).catch(err=>{
             console.log("Could not mark mail " + mail.uid + "as seen")
           })
         }).catch(err=>{
           console.log("Failed to add " + mail.subject + " (" + JSON.stringify(err) + ")")
         })
       })
     }).catch(err=>{
       console.log("Cannot get new mail: " + err)
     })
  })
}).catch(err => {
  console.log("Could not connect to database: " + JSON.stringify(err))
})


function exitHandler() {
  mailbox.close()
}

process.on('exit', exitHandler.bind())
process.on('SIGINT', exitHandler.bind())
