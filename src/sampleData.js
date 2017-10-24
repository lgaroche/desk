
import { Document } from './Documents/Document.js'


let tags = []

let docs = [
  new Document('', '', 'LCL Juillet 2016', ['bank', 'statement', 'lcl'], '2016-07-08', [{name: 'file.pdf', id: 'file.pdf', size: '2048', type: 'application/pdf'}]),
  new Document('', '', 'LCL Août 2017', ['bank', 'statement', 'lcl'], '2017-08-08'),
  new Document('', '', 'Quittance Juin 2016', ['home', 'rent'], '2016-06-01'),
  new Document('', '', 'EDF 2016', ['home', 'bills', 'edf'], '2016-12-01'),
  new Document('', '', 'ING Direct Août 2017', ['bank', 'statement', 'ing'], '2017-08-08'),
]

for(let doc of docs) {
  for(let tag of doc.tags) {
    let found = false;
    for(let e of tags) {
      console.log("ex: " + e)
      if(e.key.indexOf(tag) > -1) {
        found = true;
      }
    }
    if(!found) {
      tags.push({
        key: tag,
        value: tag,
        text: tag
      })
    }
  }
}

export {tags, docs}
