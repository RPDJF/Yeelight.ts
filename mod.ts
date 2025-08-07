/*import YeelightManager from "./managers/YeelightManager.ts";

console.log("Starting yeelight.ts...");

const yeelightManager = new YeelightManager(true);

yeelightManager.addDevices(
  Array.from((await yeelightManager.discover()).values()),
);

yeelightManager.devices.forEach(async (device, key) => {
  console.log("device info:", device.deviceInfo);

  await device.setPower({
    power: false,
    effect: "smooth",
  }).then(() => {
    console.log(`Power on command sent to device ${key}`);
  }).catch((error) => {
    console.error(`Error sending power off command to device ${key}:`, error);
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.setPower({
    power: true,
    effect: "smooth",
  }).then(() => {
    console.log(`Power off command sent to device ${key}`);
  }).catch((error) => {
    console.error(`Error sending power off command to device ${key}:`, error);
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.toggle().then(() => {
    console.log(`Toggle command sent to device ${key}`);
  }).catch((error) => {
    console.error(`Error sending toggle command to device ${key}:`, error);
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.toggle().then(() => {
    console.log(`Toggle command sent to device ${key}`);
  }).catch((error) => {
    console.error(`Error sending toggle command to device ${key}:`, error);
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.setBrightness({
    bright: 1,
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.setBrightness({
    bright: 100,
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.setBrightness({
    bright: 50,
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.setRgb({
    rgb: 0xFF0000,
    effect: "smooth",
  }).then(() => {
    console.log(`RGB command sent to device ${key}`);
  }).catch((error) => {
    console.error(`Error sending RGB command to device ${key}:`, error);
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  await device.getProperties(["bright"]).then((props) => {
    console.log(`Properties of device ${key}:`, props);
  }).catch((error) => {
    console.error(`Error getting properties of device ${key}:`, error);
  });
});
*/

export { YeelightManager } from "./managers/YeelightManager.ts";