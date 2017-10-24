

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS = []
for(let m in months) {
  let value = parseInt(m) + 1
  let textValue = value<10 ? "0" + value: value
  MONTHS.push({
    key: value,
    value: textValue,
    text: months[m]
  })
}
let YEARS = []
let DAYS = []
for(let d = 1; d <= 31; d++) {
  DAYS.push({
    key: parseInt(d),
    value: d<10? "0" + parseInt(d): parseInt(d),
    text: d
  })
}
for(let y = 2010; y <= 2018; y++) {
  YEARS.push({
    key: parseInt(y),
    value: parseInt(y),
    text: y
  })
}

export { YEARS, MONTHS, DAYS }
