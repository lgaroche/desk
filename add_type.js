module.exports = function(doc, cb){
  if(doc._id.indexOf("_design/") === -1){
    doc.createdAt = new Date();
    doc.modifiedAt = doc.createdAt;
    delete doc.files;
  }
  cb(null, doc);
}
