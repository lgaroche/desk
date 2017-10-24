import PouchDB from 'pouchdb'
import * as Auth from 'pouchdb-authentication'
import { Document } from './Documents/Document.js'

const byModifiedAt = (a,b) => {
  if(a.modifiedAt == undefined || b.modifiedAt == undefined) return 0
  var dateA = new Date(a.modifiedAt)
  var dateB = new Date(b.modifiedAt)
  return dateB.getTime() - dateA.getTime()
}

class DeskStore {
  constructor(user, password) {
    this.user = user
    return new Promise((resolve, reject) => {
      return this.connect(password).then(res => {
        console.log("Connected to DeskStore")
        console.log(res)
        this.connected = true
        return this.fetch().then(docs => {
          resolve(this)
        })
      }).catch(err => {
        console.log("Error connecting to DeskStore")
        console.log(err)
        reject(err)
      })
    })
  }

  get docs() {
    if(this._docs != undefined) {
      return this._docs
    }
  }

  set docs(docs) {
    this._docs = docs
  }

  connect(password) {
    PouchDB.plugin(Auth)
    let usersUrl = window.location.protocol+"//"+window.location.hostname+"/db/_users"
    if(window.location.hostname === "localhost") {
      usersUrl = window.location.protocol+"//"+window.location.hostname+":5984/_users"
    }
    this._users = new PouchDB(usersUrl)
    return this._users.login(this.user, password).then(res=> {
      console.log(res)
      this.deskUrl = window.location.protocol+"//"+window.location.hostname+"/db/"+res.roles[0]
      if(window.location.hostname === "localhost") {
        this.deskUrl = window.location.protocol+"//"+window.location.hostname+":5984/"+res.roles[0]
      }
      console.log(this.deskUrl)
      this.db = new PouchDB(this.deskUrl);
      return new Promise((resolve, reject) => {
        return this.db.login(this.user, password).then(res => {
          console.log("Login success")
          resolve(this)
        }).catch(err => {
          console.log("error login: " + err)
          reject(err)
        })
      })
    })
  }

  logout() {
    return this.db.logout()
  }

  get(id) {
    return this.db.get(id)
  }

  fetch() {
    console.log("Fetching documents")
    return this.db.query('documents/get?include_docs=true').then(docs => {
      let documents = []
      for(let row of docs.rows) {
        if(row.doc._id.indexOf('_design') < 0) {
          documents.push(Document.fromCouch(row.doc))
        }
      }
      this.tags = []
      this.docs = documents.sort(byModifiedAt)
      console.log("Fetching tags")
      return this.db.query('tags/get?reduce=true&group=true').then(res => {
        res.rows.forEach(row => {
          this.tags.push({
            key: row.key,
            value: row.key,
            text: row.key,
            description: row.value + " documents"})
        })
        return documents
      })
    })
  }

  create(doc) {
    return new Promise((resolve, reject) => {
      doc._attachments = {}
      if(doc.files) {
        for(let file of doc.files) {
          doc._attachments[file.name] = {
            content_type: file.type,
            data: file
          }
        }
      }
      return this.db.post({
        name: doc.name,
        date: doc.date,
        createdAt: new Date(),
        modifiedAt: new Date(),
        tags: doc.tags,
        text: doc.text,
        _attachments: doc._attachments
      }).then(res => {
        this.fetch().then(f => {
          resolve(res)
        })
      })
    })
  }

  update(doc) {
    if(!doc._attachments) doc._attachments = {}
    for(let file of doc.files) {
      if(doc._attachments[file.name]) continue /* attachment exists */
      doc._attachments[file.name] = { /* add new attachment */
        content_type: file.type,
        data: file
      }
    }
    for(let a in doc._attachments) {
      /* remove deleted attachments */
      if(doc.files.findIndex(i => i.name == a) < 0) {
        delete(doc._attachments[a])
      }
    }
    delete doc.files
    return new Promise((resolve, reject) => {
      return this.db.put(doc).then(res => {
        this.get(doc._id).then(d => {
          /*let currentDocIndex = this._docs.findIndex(i => i._id == doc._id)
          this._docs[currentDocIndex] = Document.fromCouch(d)
          this._docs.sort(byModifiedAt)
          resolve(d)*/
          this.fetch().then(f => {
            resolve(d)
          })
        })
      })
    })
  }


  delete(doc) {
    return new Promise((resolve, reject) => {
      this.db.remove(doc).then(res => {
        this.fetch().then(res => {
          resolve(true)
        })
      })
    })
  }

  deleteBulk(docs) {
    for(let doc of docs) {
      doc._deleted = true
    }
    return new Promise((resolve, reject) => {
      this.db.bulkDocs(docs).then(res => {
        this.fetch().then(res => {
          resolve(this)
        })
      })
    })
  }

  static signup(state) {
    var user = state.user
    var password = state.password
    var email = state.email
    console.log("Signup user: " + user)
    PouchDB.plugin(Auth)
    let usersUrl = window.location.protocol+"//"+window.location.hostname+"/db/_users"
    if(window.location.hostname === "localhost") {
      usersUrl = window.location.protocol+"//"+window.location.hostname+":5984/_users"
    }
    let _users = new PouchDB(usersUrl)
    return new Promise((resolve, reject) => {
      _users.signup(user, password, {
        metadata: {
          email: state.email,
          createdAt: new Date()
        }
      }).then(res => {
        console.log("User created: " + user)
        resolve(res)
      }).catch(err => {
        console.log("Cannot create user: ")
        if(err.name === "conflict") {
          console.log("User already exists")
        }
        reject(err)
      })
    })

  }
}

export { DeskStore }
