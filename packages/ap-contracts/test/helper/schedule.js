
function sortEvents (schedule) {
  schedule.sort((a,b) => {
    if (a[1] == 0) { return 1 }
    if (b[1] == 0) { return -1 }
    if (a[1] > b[1]) { return 1 }
    if (a[1] < b[1]) { return -1 }
    if (a[0] > b[0]) { return 1 }
    if (a[0] < b[0]) { return -1 }
    return 0
  })

  return schedule
}

function removeNullEvents (schedule) {
  const compactSchedule = []

  for (event of schedule) {
    if (event['scheduledTime'] === '0') { continue }
    compactSchedule.push(event)
  }

  return compactSchedule
}

module.exports = { sortEvents, removeNullEvents }
