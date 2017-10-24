
const uniqueId = (function() {
  let id = 0
  return function() { return id++ }
})()

class Document {
  constructor(name, tags, date, text, files) {
    this.name = name
    this.tags = tags
    this.date = date
    this.files = files
    this.text = text
    //this._id = uniqueId()
  }

  static fromCouch(doc) {
    let files = []
    if(doc._attachments) for(let attachment of Object.keys(doc._attachments)) {
      files.push({
        name: attachment,
        type: doc._attachments[attachment].content_type,
        size: doc._attachments[attachment].length
      })
    }
    let res = new Document(doc.name, doc.tags, doc.date, doc.text, files)
    res._id = doc._id
    res._rev = doc._rev
    res._attachments = doc._attachments
    res.createdAt = doc.createdAt
    res.modifiedAt = doc.modifiedAt
    return res
  }

/*
  get id() {
    return this.id
  }
*/

  hasText(text) {
    if(this.name.toString().toLowerCase()
      .indexOf(text.toString().toLowerCase()) > -1) return true
  }

  hasTag(tag) {
    return this.hasTags([tag])
  }

  hasTags(tags) {
    if(tags.length == 0) return true
    if(this.tags == undefined) return false
    let count = 0
    for(let tag of tags) {
      if(this.tags.indexOf(tag) > -1) count++
    }
    //if(count === tags.length)
    return count === tags.length
  }

  isAfter(date) {
    if(date.year == "") return true
    if(date.month == "") date.month = 1
    let year = this.date.substring(0, 4)
    let month = this.date.substring(5, 7)
    let docDate = parseInt(year)*100 + parseInt(month)
    let testDate = parseInt(date.year)*100 + parseInt(date.month)
    return docDate >= testDate
  }

  isBefore(date) {
    if(date.year == "") return true
    if(date.month == "") date.month = 1
    let year = this.date.substring(0, 4)
    let month = this.date.substring(5, 7)
    let docDate = parseInt(year)*100 + parseInt(month)
    let testDate = parseInt(date.year)*100 + parseInt(date.month)
    return docDate <= testDate
  }

}

export { Document }
