import logger from "../utils/logger.ts";
import DeviceManager from "./DeviceManager.ts";

export class YeelightManager {
  private _devices = new Map<string, DeviceManager>();

  constructor(logger: boolean = false) {
    if (logger) {
      Deno.env.set("YEELIGHTTS_DEBUG", "true");
    }
  }

  /**
   * Adds a new device to the Yeelight manager.
   *
   * This method creates a new `DeviceManager` instance using the provided UDP data from a Yeelight device and adds it to the internal devices map.
   *
   * @param device - The `DeviceManager` instance representing the Yeelight device to be added.
   * @returns The `DeviceManager` instance that was added to the manager.
   */
  public addDevice(device: DeviceManager): DeviceManager {
    this._devices.set(device.deviceInfo.id, device);
    return device;
  }

  /**
   * Adds a new device to the Yeelight manager.
   *
   * This method creates a new `DeviceManager` instance using the provided UDP data from a Yeelight device and adds it to the internal devices map.
   *
   * @param devices - An array of `DeviceManager` instances representing the Yeelight devices to be added.
   * @returns An array of `DeviceManager` instances that were added to the manager.
   */
  public addDevices(devices: DeviceManager[]): DeviceManager[] {
    for (const device of devices) {
      this._devices.set(device.deviceInfo.id, device);
    }
    return devices;
  }

  /**
   * Returns a map of all devices in the Yeelight manager.
   */
  public get devices(): Map<string, DeviceManager> {
    return this._devices;
  }

  /**
   * @param id - The ID of the device to retrieve.
   * @returns The `DeviceManager` instance for the device with the specified ID, or undefined if no such device exists.
   */
  public getDevice(id: string): DeviceManager | undefined {
    return this._devices.get(id);
  }

  /**
   * Connects all devices in the manager.
   *
   * This method iterates over all devices in the manager and calls their `connect` method. It will update the device's state and ensure they are ready for use.
   *
   * @param excludeUnhealthy - If true, only healthy devices will be returned in a new map instance. If false, all devices will be returned regardless of their health status. Default is false.
   * @returns A promise that resolves to a Map of devices, where the key is the device's ID and the value is the `DeviceManager` instance for that device.
   */
  public async connectAll(
    excludeUnhealthy: boolean = false,
  ): Promise<Map<string, DeviceManager>> {
    const connectPromises = this._devices.values().map((device) =>
      device.connect()
    );
    await Promise.all(connectPromises);
    if (!excludeUnhealthy) {
      return this._devices;
    }
    return new Map([...this._devices].filter((set) => set[1].isHealthy));
  }

  /**
   * Scans the local network for Yeelight devices.
   *
   * This method sends a multicast UDP M-SEARCH request to discover Yeelight devices (more info at https://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf)
   *
   * @param timeout - The time in milliseconds to wait for responses. Default is 5000ms (5 seconds).
   * @return A promise that resolves to a Map of discovered devices, where the key is the device's location (IP:port) and the value is a DeviceManager instance for that device.
   */
  public async discover(timeout: number = 5000) {
    const pulledDevices = new Map<string, DeviceManager>();
    const sockets = new Map<Deno.NetworkInterfaceInfo, Deno.DatagramConn>();

    // As stated from https://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf
    const encoder = new TextEncoder();
    const data = encoder.encode(
      `M-SEARCH * HTTP/1.1\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n\r\n`,
    );

    // iterate over all network interfaces -> ensure we find devices on all interfaces, "0.0.0.0" is not sufficient on some systems
    const interfaces = Deno.networkInterfaces();
    for (const iface of interfaces) {
      if (iface.family !== "IPv4" || iface.address.startsWith("127.")) {
        continue;
      }
      logger.log(`Searching on interface: ${iface.name} (${iface.address})`);
      // Bind to local interface
      const socket = Deno.listenDatagram({
        port: 1982,
        transport: "udp",
        hostname: iface.address,
        reuseAddress: true,
      });

      if (!("port" in socket.addr)) {
        throw new Error(
          `Failed to bind to port 1982 on interface ${iface.name} (${iface.address})`,
        );
      }

      logger.log(`Listening on ${iface.name} (${iface.address})`);
      logger.log(`Socket bound to port ${socket.addr.port}`);
      sockets.set(iface, socket);

      // Listen for responses on the socket
      (async () => {
        logger.log(
          `Listening for responses on ${iface.name} (${iface.address})`,
        );
        for await (const [data, addr] of socket) {
          if (!("hostname" in addr) || !("port" in addr)) {
            throw new Error(`Invalid address format: ${JSON.stringify(addr)}`);
          }
          const response = new TextDecoder().decode(data);
          const deviceLocation = `${addr.hostname}:${addr.port}`;
          if (pulledDevices.has(deviceLocation)) {
            logger.log(
              `Device already pulled from ${addr.hostname}:${addr.port}`,
            );
            continue;
          }
          logger.log(`Received response from ${addr.hostname}:${addr.port}`);
          logger.log(response);
          try {
            logger.log(`Adding device ${addr.hostname}:${addr.port}`);
            const device = new DeviceManager(data);
            pulledDevices.set(deviceLocation, device);
            logger.log(
              `${device.deviceInfo.name} (${device.deviceInfo.id}) added from ${addr.hostname}:${addr.port}`,
            );
          } catch (error) {
            logger.error(
              `Error adding device from ${addr.hostname}:${addr.port}:`,
              error,
            );
          }
        }
      })();

      // Send M-SEARCH request
      logger.log(
        `Sending discovery request on interface ${iface.name} (${iface.address})`,
      );
      await socket.send(data, {
        hostname: "239.255.255.250",
        port: 1982,
        transport: "udp",
      }).then(() => {
        logger.log(
          `Sent discovery request on interface ${iface.name} (${iface.address})`,
        );
      }).catch((error) => {
        logger.error(
          `Error sending discovery request on interface ${iface.name} (${iface.address}):`,
          error,
        );
      });
    }

    // Time to live for the discovery process
    logger.log(`Waiting for responses for ${timeout / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, timeout));
    for (const socket of sockets) {
      logger.log(`Closing socket on interface ${socket[0].name}`);
      socket[1].close();
    }
    logger.log("Discovery process completed.");

    // Log the devices found
    if (pulledDevices.size === 0) {
      logger.warn("No devices found during search.");
      logger.warn(
        `Make sure your devices are powered on and connected to the network. Also ensure that the port 1982 is not blocked by a firewall like UFW.`,
      );
    }
    return pulledDevices;
  }
}
