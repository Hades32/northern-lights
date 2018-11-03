const tradfri = require("node-tradfri-client")
const Planetcalc = require("./planetcalc.js").Planetcalc
const moment = require("moment")
const momenttz = require("moment-timezone")

const white_night = 100
const white_sunset = 50
const white_daylight = 0

async function doit() {
  let client = new tradfri.TradfriClient("192.168.178.157")
  //const {identity, psk} = await client.authenticate("sbhTrTeWvpUzfGdY")
  const identity = "tradfri_1541172237270"
  const psk = "CTtxvzsx0vqZekef"
  console.log(identity, psk)
  await client.connect(identity, psk)
  // observe devices
  await client
    .on("device updated", tradfri_deviceUpdated)
    .on("device removed", tradfri_deviceRemoved)
    .observeDevices();
}

const lightbulbs = {};

function tradfri_deviceUpdated(device) {
  if (device.type === tradfri.AccessoryTypes.lightbulb) {
    let oldDeviceState = lightbulbs[device.instanceId]
    lightbulbs[device.instanceId] = device
    console.log(`${device.instanceId} - ${device.name} - ${device.deviceInfo.modelNumber} - on:${device.lightList[0].onOff} - ${device.lightList[0].dimmer}%`)
    if (oldDeviceState) {
      handleChange(oldDeviceState, device)
    }
  }
}

function tradfri_deviceRemoved(instanceId) {
  delete lightbulbs[instanceId]
}

function handleChange(oldDevice, device){
  if (oldDevice.lightList[0].onOff === false && device.lightList[0].onOff === true) {
    handleSwitchedOn(device)
  }
}

function handleSwitchedOn(device){
  let lightColor = getCurrentLightColor()
  device.lightList[0].setColorTemperature(lightColor)
}

function getCurrentLightColor(){
  let mom = moment().tz("Europe/Berlin")
  let today = mom.toDate()
  let sun = Planetcalc.Calculate318({
    "day": today,
    "plat": 48.4, // Ulm :)
    "plon": 10.1,
    "gmtdiff": mom.utcOffset() / 60
  })
  return altitudeToLightColor(sun.altitude)
}

function altitudeToLightColor(alt) {
  let daylightColor = white_daylight
  if (alt < 0) {
    daylightColor = white_sunset
  }
  if (alt < -5) {
    daylightColor = white_night
  }
  return daylightColor
}

let lastLightColor = 999//getCurrentLightColor()
function checkSunChanged() {
  let currentLightColor = getCurrentLightColor()
  if (currentLightColor === lastLightColor){
    return
  }
  lastLightColor = currentLightColor
  console.log("the sun has changed!")
  // if light color has changed, switch it for all
  // siwtched on lights
  let timeout = 0;
  for (const key in lightbulbs) {
    if (!lightbulbs.hasOwnProperty(key)) {
      continue
    }
    const light = lightbulbs[key];
    tradfri.dev
    if (light.lightList[0].onOff === false) {
      continue
    }
    console.log(`${light.name} will be handled`)
    setTimeout(()=>handleSwitchedOn(light), timeout)
    timeout += 1000
  }
}

setInterval(checkSunChanged, 60*1000)

doit()