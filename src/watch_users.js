const PouchDB = require("pouchdb")
const request = require("superagent")

const userpass = "user:password"
const url = "http://"+userpass+"@localhost:5984"
var usersDb = new PouchDB(url + "/_users")

usersDb.info().then(res => {console.log("Connected")})

let users = []
usersDb.allDocs().then(res => {
  for(let doc of res.rows) {
    users.push(doc.key)
  }
})

const designDoc = {
  "_id": '_design/documents',
  "views": {
    "get": {
      "map": "function (doc) {\n  //if(doc.type == \"document\") emit(doc._id, 1);\n  if(doc._id.indexOf(\"_\") == -1) emit(doc._id, 1);\n}"
    }
  },
  "language": "javascript"
}

const designTagsDoc = {
  "_id": "_design/tags",
  "views": {
    "get": {
      "map": "function (doc) {\n  for (var i in doc.tags) {\n    emit(doc.tags[i], 1)\n  }\n}",
      "reduce": "_count"
    }
  },
  "language": "javascript"
}


usersDb.changes({
  since: 'now',
  live: true
}).on('change', change => {
  console.log("Change detected: " + change.id)
  if(change.deleted != true && users.indexOf(change.id) == -1) {
    users.push(change.id)
    console.log("New user")
    var user = change.id.split(":")
    var name = user[user.length-1]
    var dbBuf = new Buffer(name)
    var dbName = dbBuf.toString("hex")
    console.log(dbName)
    var db = new PouchDB(url + "/userdb-" +dbName)
    db.info().then(res => {
      var security = {
        "admins": {
          "names": [change.id],
          "roles": ["userdb-"+dbName]
        },
        "members": {
          "names": [change.id],
          "roles": ["userdb-"+dbName]
        }
      }
      request.put(url + "/userdb-" + dbName + "/_security")
        .send(security)
        .end((err, res) => {
          if(err) {
            console.log("error security update: " + err)
          } else {
            usersDb.get(change.id).then(doc => {
              doc.roles = ["userdb-"+dbName]
              usersDb.put(doc).then(update => {
                console.log("Db updated: " + update.ok)
                db.put(designDoc).then(res => {
                  console.log("_design/documents saved")
                  db.put(designTagsDoc).then(res => {
                    console.log("_design/tags saved")
                  }).catch(err => {
                    console.log("_design/tags design doc")
                  })
                }).catch(err => {
                  console.log("_design/documents design doc")
                })
              }).catch(err => {
                console.log("Could not update " + change.id)
                console.log(err)
              })
            }).catch(err => {
              console.log("Could not get " + change.id)
              console.log(err)
            })
          }
        })
    }).catch(err=>{
      console.log(err)
    })
  } else if(change.deleted) {
    console.log("User was deleted")
    users.splice(users.indexOf(change.id), 1)
  }
}).on('error', err => {
  console.log(err)
})
