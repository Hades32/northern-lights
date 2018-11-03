const tradfri = require("node-tradfri-client")
const Planetcalc = require("./planetcalc.js").Planetcalc
const moment = require("moment")
const momenttz = require("moment-timezone")

var ts = [
  moment.tz("2018-11-02 00:00", "Europe/Berlin"),
  moment.tz("2018-11-02 01:00", "Europe/Berlin"),
  moment.tz("2018-11-02 02:00", "Europe/Berlin"),
  moment.tz("2018-11-02 03:00", "Europe/Berlin"),
  moment.tz("2018-11-02 04:00", "Europe/Berlin"),
  moment.tz("2018-11-02 05:00", "Europe/Berlin"),
  moment.tz("2018-11-02 06:00", "Europe/Berlin"),
  moment.tz("2018-11-02 07:00", "Europe/Berlin"),
  moment.tz("2018-11-02 08:00", "Europe/Berlin"),
  moment.tz("2018-11-02 09:00", "Europe/Berlin"),
  moment.tz("2018-11-02 10:00", "Europe/Berlin"),
  moment.tz("2018-11-02 11:00", "Europe/Berlin"),
  moment.tz("2018-11-02 12:00", "Europe/Berlin"),
  moment.tz("2018-11-02 13:00", "Europe/Berlin"),
  moment.tz("2018-11-02 14:00", "Europe/Berlin"),
  moment.tz("2018-11-02 15:00", "Europe/Berlin"),
  moment.tz("2018-11-02 16:00", "Europe/Berlin"),
  moment.tz("2018-11-02 17:00", "Europe/Berlin"),
  moment.tz("2018-11-02 18:00", "Europe/Berlin"),
  moment.tz("2018-11-02 19:00", "Europe/Berlin"),
  moment.tz("2018-11-02 20:00", "Europe/Berlin"),
  moment.tz("2018-11-02 21:00", "Europe/Berlin"),
  moment.tz("2018-11-02 22:00", "Europe/Berlin"),
  moment.tz("2018-11-02 23:00", "Europe/Berlin"),
];

ts.forEach(t => {
  let today = t.toDate()
  let offset = t.utcOffset() / 60;
  let sun = Planetcalc.Calculate318({
    "day": today,
    "plat": 48.4,
    "plon": 10.1,
    "gmtdiff": offset
  })
  console.log(`${t.hour()}(${offset})\t${sun.altitude}`)
})