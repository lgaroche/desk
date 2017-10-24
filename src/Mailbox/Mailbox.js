const imap = require('imap-simple')
const mimecodec = require('emailjs-mime-codec')
const async = require('async')

class Mailbox {
  constructor(config) {
    this.config = config
  }

  connect(onMail) {
    this.config.onmail = onMail
    console.log("Mailbox::connect")
    imap.connect(this.config).then(conn=>{
      this.connection = conn
      conn.openBox('INBOX').then(()=>{
        console.log("Mailbox::INBOX opened")
      })
    })
  }

  close() {
    console.log("Mailbox::close")
    if(this.connection) this.connection.end()
  }

  fetchNewMails() {
    return new Promise((resolve, reject) => {
      var searchCriteria = ['UNSEEN']
      var fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
        struct: true,
        markSeen: false
      }
      return this.connection.search(searchCriteria, fetchOptions).then(messages => {
        var mails = []
        messages.forEach((message) => {
          console.log(message.attributes.uid + ") " + message.parts[0].body.subject)
          var parts = imap.getParts(message.attributes.struct)
          var partsDataPromises = []
          parts.forEach((part, index) => {
            partsDataPromises.push(new Promise((resolve, reject) => {
              var p = {
                content_type: part.type + '/' + part.subtype,
                part_id: part.partID,
                name: "MIME Part: " + index,
                index: index
              }
              if(part.disposition &&
                (part.disposition.type === 'attachment' ||
                part.disposition.type === 'inline')) {
                    p.name = mimecodec.mimeWordDecode(part.params.name)
                }
              this.connection.getPartData(message, part).then(partData => {
                if(part.encoding == 'quoted-printable') {
                  var decoded = mimecodec.quotedPrintableDecode(partData, 'ascii')
                  p.data = Buffer.from(decoded, 'ascii')
                  if(index == 0 && part.subtype == "plain") message.text = decoded
                }
                else if(part.encoding == 'base64') {
                  p.data = partData
                }
                else {
                  p.data = Buffer.from(partData, 'ascii')
                  if(index == 0 && part.subtype == "plain") message.text = partData
                }
                resolve(p)
              })
            }))
          })
          var part = message.parts[0]
          mails.push(new Promise((resolve, reject) => {
            Promise.all(partsDataPromises).then(data => {
              console.log("Getting attachment data for: " + part.body.subject[0])
              resolve({
                uid: message.attributes.uid,
                from: part.body.from[0],
                subject: part.body.subject[0],
                date: part.body.date[0],
                text: message.text,
                attachments: data
              })
            }).catch(err => {
              reject("Cannot resolve partsDataPromises " + err)
            })
          }))
        })
        Promise.all(mails).then(mail => {
          resolve(mail)
        }).catch(err => {
          reject("Cannot resolve mails: " + err)
        })
      }).catch(err=>{
        reject(err)
      })
    })
  }

  markAsSeen(ids) {
    return new Promise((resolve, reject) => {
      this.connection.addFlags(ids, ['\\Seen'], (err) => {
        if (err) {
          console.log('Error deleting message: ', err)
          reject(err)
        } else {
          console.log('MAILBOX::markedAsSeen')
          resolve()
        }
      })
    })
  }
}

module.exports = Mailbox

exports.connect = (onMail) => {
  imap.connect({
    imap: config.imap,
    onmail: onMail
  }).then(con=>{
    con.openBox('INBOX').then(()=>{
      console.log("mailbox opened")
    })
  })
}

exports.list = () => {
  return new Promise((resolve, reject) => {
    imap.connect(config).then((connection) => {
      return connection.openBox('INBOX').then(() => {
        var searchCriteria = ['UNSEEN']
        var fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true,
          markSeen: false
        }

        return connection.search(searchCriteria, fetchOptions).then((messages) => {
          var mails = []
          messages.forEach((message) => {
            console.log(Object.keys(message))
            var part = message.parts[0]
            mails.push({
              uid: message.attributes.uid,
              from: part.body.from[0],
              subject: part.body.subject[0],
              date: part.body.date[0],
            })
          })
          resolve(mails)
          connection.end()
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  })
}

var getMessageByUID = (connection, uid) => {
  return new Promise((resolve, reject) => {
    return connection.openBox('INBOX').then(() => {
      var searchCriteria = [['UID', uid]]
      var fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        struct: true,
        markSeen: false
      }
      return connection.search(searchCriteria, fetchOptions).then((messages) => {
        resolve(messages[0])
      })
    })
  })
}

// TODO: get multiple attachments at once
exports.getAttachments = (mailUid, attachmentsId) => {
  return imap.connect(config).then((connection) => {
    return getMessageByUID(connection, mailUid).then((message) => {
      var parts = imap.getParts(message.attributes.struct)
      var attachments = []

      attachmentsId.forEach((id) => {
        var part = parts.find((part) => {
          return part.partID == id
        })
        if(!part) return
        attachments.push(connection.getPartData(message, part).then((partData) => {
          console.log('Getting attachment from mail ' + part.params.name)
          var type = part.type + '/' + part.subtype
          var name = mimecodec.mimeWordDecode(part.params.name)
          if (!name) name = 'Attachment'
          return {
            'Content-Type': type,
            name: name,
            body: partData
          }
        }))
      })
      return Promise.all(attachments)
        /*
        var part = parts.find((part) => {
          return part.partID === attachmentId
        })
        return connection.getPartData(message, part).then((partData) => {
          connection.end()
          console.log('Getting attachment from mail ' + part.params.name)
          var type = part.type + '/' + part.subtype
          var name = mimecodec.mimeWordDecode(part.params.name)
          if (!name) name = 'Attachment'
          return {
            'Content-Type': type,
            name: name,
            body: partData
          }
        })
        */
    })
  }).catch((err) => {
    console.log('Connection error: ' + err)
    return new Promise((resolve, reject) => {
      reject(err)
    })
  })
}

exports.get = (id) => {
  return new Promise((resolve, reject) => {
    console.log('Mail: getting message uid ' + id)
    imap.connect(config).then((connection) => {
      getMessageByUID(connection, id).then((message) => {
        var parts = imap.getParts(message.attributes.struct)
        var partsData = [{
          message: message
        }]
        console.log('Message has ' + parts.length + ' parts')
        parts.forEach((part, index) => {
          if (part.disposition && (part.disposition.type === 'attachment' || part.disposition.type === 'inline')) {
            console.log('Part ' + index + ' is an attachment')
            partsData.push({
              id: part.partID,
              type: part.type + '/' + part.subtype,
              name: mimecodec.mimeWordDecode(part.params.name),
              size: Math.round((parseInt(part.size) / 1024)) + ' kB'
            })
          } else if (part.subtype === 'html') {
            console.log('Part ' + index + ' is html')
            partsData.push({
              id: part.partID,
              type: part.type + '/' + part.subtype,
              name: 'HTML part',
              size: Math.round((parseInt(part.size) / 1024)) + ' kB'
            })
          } else {
            console.log('Part ' + index + ' is text?')
            partsData.push(connection.getPartData(message, part).then((partData) => {
              return {
                type: 'text/plain',
                body: partData
              }
            }))
          }
        })
        return Promise.all(partsData) // TODO: improve this part
      }).then((parts) => {
        var message = parts.shift().message
        var header = message.parts.filter((part) => {
          return part.which === 'HEADER'
        })[0].body
        var text = parts.filter((part) => {
          return part.body != null
        })[0].body
        var attachments = parts.filter((part) => {
          return part.id != null
        })
        var mail = {
          uid: message.attributes.uid,
          from: header.from[0],
          subject: header.subject[0],
          date: header.date[0],
          text: text,
          attachments: attachments
        }
        resolve(mail)
        connection.end()
      }).catch((err) => {
        reject(err)
        connection.end()
      })
    })
  })
}

exports.fetch = (callback) => {
  return new Promise((resolve, reject) => {
    imap.connect(config).then((connection) => {
      return connection.openBox('INBOX').then(() => {
        var searchCriteria = ['UNSEEN']
        var fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true,
          markSeen: false
        }

        return connection.search(searchCriteria, fetchOptions).then((res) => {
          // console.log(res)
          res.forEach((r) => {
            console.log('uid: ' + r.attributes.uid)
            r.parts.forEach((part) => {
              if (part.which === 'HEADER') {
                console.log(part.body.from[0])
                console.log(part.body.subject[0])
                console.log(part.body.date[0])
              } else {
                // console.log(part.body)
              }
            })
            /* connection.addFlags(r.attributes.uid, ['\\Seen', '\\Deleted'], (err) => {
              if (err) {
                console.log('Error deleting message: ', err)
              } else {
                console.log('Message deleted')
              }
            }) */
          })
          // callback(null, res)
          resolve(res)
          connection.end()
        })
      })
    })
  })
}

exports.markAsSeen = (messages) => {
  return new Promise((resolve, reject) => {
    console.log(messages.length)
    if (messages.length < 1) {
      console.log('rejecting')
      reject(new Error('Empty uid list'))
      return
    }
    imap.connect(config).then((connection) => {
      return connection.openBox('INBOX').then(() => {
        connection.addFlags(messages, ['\\Seen', '\\Deleted'], (err) => {
          if (err) {
            console.log('Error deleting message: ', err)
            connection.end()
            reject(err)
          } else {
            console.log('Message deleted')
            connection.end()
            resolve()
          }
        })
      })
    })
  })
}

exports.delete = (id) => { // TODO: multiple id
  return new Promise((resolve, reject) => {
    imap.connect(config).then((connection) => {
      return connection.openBox('INBOX').then(() => {
        return connection.addFlags(id, ['\\Seen', '\\Deleted'], (err) => {
          if (err) {
            console.log('Error deleting message: ', err)
            reject(err)
          } else {
            console.log('Message marked as seen and deleted')
            return connection.moveMessage(id, 'Trash', (err) => {
              if (err) {
                console.err(err)
                connection.end()
                reject(err)
              } else {
                console.log('Mail: Message moved to trash')
                connection.end()
                resolve()
              }
            })
          }
        })
      })
    })
  })
}
