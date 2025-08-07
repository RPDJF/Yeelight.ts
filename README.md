<!--<img src="meta/banner.svg" alt="Yeelight.ts Banner" style="border-radius: 15px;">-->

# Yeelight.ts - Unofficial Yeelight Control Library for Deno 💡

![Development Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge&logo=github)
![Test Status](https://img.shields.io/badge/Tested-on%20Yeelight%20Color%204-blueviolet?style=for-the-badge&logo=deno)

![Deno badge](https://img.shields.io/badge/Deno-464647?style=for-the-badge&logo=deno&logoColor=white)
![TypeScript badge](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Yeelight.ts** is a **simple**, **fast**, and **Deno-native** library to
discover and control your **Yeelight smart bulbs** and devices.

With support for essential commands like **toggle**, **power on/off**,
**brightness**, **RGB/HSV control**, and **getting properties**, this library
makes it easy to automate or build tools around your smart lighting system.

🚧 **Heads up!** The library is still in early development. You’re welcome to
follow along and share feedback!

I would not recommend using it in production yet, but it’s stable enough for
really basic usage.

---

## ✨ Why Yeelight.ts?

1. **Scan your lights automatically** – No need to hardcode IPs (manual IP mode
   coming soon).
2. **Basic control out of the box** – Power, brightness, color control & more.
3. **TypeScript-powered** – Strong typing and autocomplete.
4. **Cross-model support** – Currently tested on Color 4, should work with other
   models sharing the same API.
5. **Built for Deno** – No build setup, just run.

---

## 🌟 Features (So Far...)

- ✅ Scan for Yeelight devices on your local network.
- ✅ Send commands like:
  - Power on/off
  - Toggle
  - Set HSV
  - Set RGB
  - Set brightness
  - Get current properties
- 🔄 More control commands coming soon.
- ❌ Manual IP device addition (**coming soon**).

💡 **Coming Soon:**

Have a look at the [roadmap](#-roadmap-to-awesomeness-) for planned features or make a request!

---

## 🚧 Roadmap to Awesomeness 🗺️

| Feature                                    | Status         | On stable release ? | Comment                           |
| ------------------------------------------ | -------------- | ------------------- | --------------------------------- |
| Stable release                             | 🔄 In Progress | ✅                  |                                   |
| Automatic device discovery                 | ✅ Complete    | ✅                  |                                   |
| Manual device addition (via IP)            | ❌ Not Started | ✅                  |                                   |
| Basic control: Power, RGB, HSV, Brightness | ✅ Complete    | ✅                  |                                   |
| Property getter                            | ✅ Complete    | ✅                  |                                   |
| Documentation & examples                   | 🔄 In Progress | ✅                  |                                   |
| Health checks & error handling             | ❌ Not Started | ❓                  | Should it be handled by library ? |
| Scene & color flow control                 | ❌ Not Started | ❌                  |                                   |
| Retry system                               | ❌ Not Started | ❌                  |                                   |
| Device grouping                            | ❌ Not Started | ❌                  |                                   |

---

## 🚀 Getting Started
### 🚧 Setup the environment
To use this library, specifically when using discovery features, you need to check that your device can be reached through the `1982` UDP port, which is the default port for Yeelight devices.

When a device is discovered, it will try to send an UDP packet to the device, which will respond with its IP address and port. If the port is not open, the device will not be discovered.

Firewall rules may block the discovery packets. (For example, on Linux, you can use `ufw` to allow the port: `sudo ufw allow 1982/udp`. Windows should not have this issue, but you may need to allow the Deno executable in your firewall settings.)

### 🛠️ Importing the Library
Until the first stable release is published on [deno.land/x](https://deno.land/x?query=yeelight), you can temporarily import the library using one of these options:

#### 🔄 Latest (may change)
```ts
import { YeelightManager } from "https://raw.githubusercontent.com/RPDJF/Yeelight.ts/main/mod.ts";
```

#### 📌 Fixed Commit (recommended for stability)
```ts
import { YeelightManager } from "https://raw.githubusercontent.com/RPDJF/Yeelight.ts/98cdd0f27f24173dcf29eb1b483493686e7a65ed/mod.ts";
```
A proper versioned import will be available once the library is published on [deno.land/x](https://deno.land/x?query=yeelight).

### 📦 Deno flags

- `--allow-net` - Required for network access to discover and control devices.
- `--unstable-net` - Required for using unstable network features such as
  `Deno.listenDatagram` for device discovery.
- `--allow-sys` - Required for accessing network interfaces (for discovery).
- `--allow-env` - Required for debugging output.

### 🎯 Example Usage

It may change in the future, but for now, here’s a quick example to get you
started:

```ts
const manager = new YeelightManager();

// Scan the network for devices with a timeout of 1000ms (5000ms by default)
const discoveredDevices = await manager.discover(1000);

// Add discovered devices to the manager
manager.addDevices(Array.from(discoveredDevices.values()));

// Toggle managed devices
manager.devices.forEach((device, key) => {
  device.toggle().then(() => {
    console.log(`Toggled device ${key}`);
  }).catch((error) => {
    console.error(`Error toggling device ${key}:`, error);
  });
});
```

You can also set properties:

```ts
device.setRgb({
  rgb: 0xFF0000,
  effect: "smooth", // optional
  duration: 500, // optional, in milliseconds
});
```

And get device state:

```ts
const props = await device.getProperties(["power", "bright", "rgb"]);
console.log(props);
```

### ⚙️ Debugging

_It may change in the future._

You can enable debugging output to see the raw commands and responses

```ts
const manager = new YeelightManager(true);
```

or

Linux/macOS:

```bash
export YEELIGHTTS_DEBUG=true
```

Windows:

```cmd
set YEELIGHTTS_DEBUG=true
```

---

## 💡 What is Yeelight?

Yeelight is a smart lighting brand that offers Wi-Fi-enabled bulbs, strips, and
lamps. Devices communicate over a **local LAN control protocol**, allowing full
control without the cloud.

The Yeelight API supports:

- Power & toggle commands
- Color and brightness control
- Scenes, flows, music mode, and more

**This library interacts directly with that local LAN protocol.**

---

## 🌌 Why Deno?

Deno is **secure**, **modern**, and has **built-in TypeScript support** —
perfect for building network tools like this.

Also, there is no Yeelight library for Deno yet, so I decided to create one!

---

## 🛤️ What’s Next?

The goal is to build a feature-rich, fully-typed Yeelight controller for Deno
that works with all Yeelight models.

Want to contribute or share ideas? Open an issue or fork the repo — I’d love to
hear your thoughts! 😊

---

## 📜 License

This project is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

It just means that the author should be credited, other than that, you can use it or edit it for any possible purpose, no restrictions!

<a href="https://github.com/RPDJF/Yeelight.ts">Yeelight.ts</a> © 2025 by <a href="https://github.com/RPDJF">RPDJF</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">

---

✨ **Let there be light — in TypeScript!** ✨
