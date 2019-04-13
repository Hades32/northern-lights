const tradfri = require("node-tradfri-client");
const Planetcalc = require("./planetcalc.js").Planetcalc;
const moment = require("moment");
const momenttz = require("moment-timezone");

const white_night = 100;
const white_sunset = 50;
const white_daylight = 0;

const GW_DELAY = 1000

//const {identity, psk} = await client.authenticate("key from back off device")
let config = {
  identity: process.env.GW_IDENTITY, // "identity"
  psk: process.env.GW_PSK, // "and psk that you get from authenticate"
  gwAddress: process.env.GW_ADDRESS //your gateway IP. should be static
}
try {
  var fs = require("fs");
  let cfgJson = fs.readFileSync("/etc/northern-lights/config.json", "utf8");
  config = JSON.parse(cfgJson);
  log("using config from config file")
} catch {
  log("using config from environment")
}

async function doit() {
  let client = new tradfri.TradfriClient(config.gwAddress, {
    watchConnection: true,
  });
  await client.connect(
    config.identity,
    config.psk
  );
  // observe devices
  await client
    .on("device updated", tradfri_deviceUpdated)
    .on("device removed", tradfri_deviceRemoved)
    .observeDevices();
}

const lightbulbs = {};

async function tradfri_deviceUpdated(device) {
  if (device.type === tradfri.AccessoryTypes.lightbulb) {
    let oldDeviceState = lightbulbs[device.instanceId];
    lightbulbs[device.instanceId] = device;
    log(
      `${device.instanceId} - ${device.name} - ${
        device.deviceInfo.modelNumber
      } - on:${device.lightList[0].onOff} - ${device.lightList[0].dimmer}%`
    );
    if (oldDeviceState) {
      await handleChange(oldDeviceState, device);
    }
  }
}

function tradfri_deviceRemoved(instanceId) {
  delete lightbulbs[instanceId];
}

async function handleChange(oldDevice, device) {
  if ( 
    // is on and was
    device.lightList[0].onOff === true &&
    ( // turned on
    oldDevice.lightList[0].onOff === false
    || // or power switched on
    oldDevice.alive === false &&
    device.alive === true
    ) 
  ) {
    await handleSwitchedOn(device, true);
  }
}

function handleSwitchedOn(device, adaptDimmer) {
  let lightColor = getCurrentLightColor();
  if (device.lightList[0].colorTemperature === lightColor) {
    return // nothing todo
  }
  log(`switching ${device.name} to ${lightColor}`)
  let newLightState = {
    colorTemperature: lightColor,
  }
  if (adaptDimmer) {
    newLightState.dimmer = 100;
  }
  return device.lightList[0].operateLight(newLightState);
}

function getCurrentLightColor() {
  let mom = moment().tz("Europe/Berlin");
  let today = mom.toDate();
  let sun = Planetcalc.Calculate318({
    day: today,
    plat: 48.4, // Ulm :)
    plon: 10.1,
    gmtdiff: mom.utcOffset() / 60
  });
  return altitudeToLightColor(sun.altitude);
}

function altitudeToLightColor(alt) {
  let lightColor = white_daylight;
  if (alt < 0) {
    lightColor = white_sunset;
  }
  if (alt < -5) {
    lightColor = white_night;
  }
  return lightColor;
}

let lastLightColor = getCurrentLightColor();
async function checkSunChanged() {
  let currentLightColor = getCurrentLightColor();
  if (currentLightColor === lastLightColor) {
    return;
  }
  lastLightColor = currentLightColor;
  log("the sun has changed!");
  // if light color has changed, switch it for all
  // siwtched on lights
  let timeout = 0;
  for (const key in lightbulbs) {
    if (!lightbulbs.hasOwnProperty(key)) {
      continue;
    }
    const light = lightbulbs[key];
    tradfri.dev;
    if (light.lightList[0].onOff === false) {
      continue;
    }
    log(`${light.name} will be handled`);
    await handleSwitchedOn(light);
    timeout += GW_DELAY;
  }
}

function log() {
  console.log("[",new Date(), "] ", ...arguments)
}

setInterval(checkSunChanged, 60 * 1000);

doit();
