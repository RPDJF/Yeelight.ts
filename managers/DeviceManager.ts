import {
  IMessage,
  IMessageResponse,
  IMessageSetHsv,
  IMessageSetPower,
  IMessageSetRgb,
  IMessageToggle,
  Methods,
  Props,
  SetBrightParams,
  SetHsvParams,
  SetPowerParams,
  SetRgbParams,
} from "../types/messages.ts";
import logger from "../utils/logger.ts";

export interface IDeviceManagerConfig {
  name: string;
  id: string;
  location: string;
  ip: string;
  port: number;
  model: string;
  firmwareVersion: string;
  support: string[];
  power: boolean;
  brightness: number;
  colorMode: string;
  colorTemperature: number | null;
  rgb: number | null;
  hue: number | null;
  saturation: number | null;
}

class DeviceManager {
  private _conf: IDeviceManagerConfig;
  private _socket: Deno.TcpConn | null = null;
  private _queue: Map<number, [IMessage, (value: IMessageResponse) => void]> =
    new Map();
  private _timeout: number;

  constructor(udpData: Uint8Array<ArrayBuffer>, timeout: number = 5000) {
    this._timeout = timeout;
    const decoder = new TextDecoder();
    const data = decoder.decode(udpData);
    this._conf = this.parseConfig(data);
    this.connect().then(async (device) => {
      const buffer = new Uint8Array(1024);
      while (true) {
        const bytesRead = await device.socket.read(buffer);
        if (bytesRead === null) {
          console.log("Connection closed");
          this._socket?.close();
          this._socket = null;
          break;
        }
        const data = buffer.subarray(0, bytesRead);
        this._onResponse(data);
      }
    }).catch((error) => {
      logger.error(
        `Failed to connect to device ${this._conf.name} (${this._conf.id}):`,
        error,
      );
    });
    logger.log(
      `DeviceManager initialized for ${this._conf.name} (${this._conf.id}) at ${this._conf.ip}:${this._conf.port}`,
    );
  }

  private _onResponse(response: Uint8Array) {
    const rawResponse = new TextDecoder().decode(response).split("\n").map((
      s,
    ) => s.trim()).filter((s) => s.length > 0);
    const responseObject: IMessageResponse = JSON.parse(
      rawResponse[rawResponse.length - 1],
    );
    if (!responseObject.id) {
      logger.error(
        `Response does not contain an ID: ${
          rawResponse[rawResponse.length - 1]
        }`,
      );
      return;
    }
    const set = this._queue.get(responseObject.id);
    if (set) {
      set[1](responseObject);
      this._queue.delete(responseObject.id);
    }
    logger.info(
      `Response ${responseObject.id}: ${
        rawResponse[rawResponse.length - 1]
      } device ${this._conf.name} (${this._conf.id})`,
    );
  }

  private parseConfig(data: string) {
    const lines = data.split("\r\n");
    if (lines[0] !== "HTTP/1.1 200 OK") {
      throw new Error(
        "Invalid response from device. Expected 'HTTP/1.1 200 OK'.",
      );
    }
    const httpHeader = new Map<string, string>();
    for (const line of lines) {
      if (!line.includes(": ")) continue;
      const [key, value] = line.split(": ");
      if (key && value) {
        httpHeader.set(key.toLowerCase(), value);
      }
    }
    this._conf = {
      name: httpHeader.get("name") || "Unknown Device",
      id: httpHeader.get("id") || "",
      location: httpHeader.get("location") || "",
      ip: httpHeader.get("location")?.split("/")[2].split(":")[0] || "",
      port: parseInt(httpHeader.get("location")?.split(":")[2] || "0", 10),
      model: httpHeader.get("model") || "",
      firmwareVersion: httpHeader.get("fw_ver") || "",
      support: (httpHeader.get("support") || "").split(",").map((s) =>
        s.trim()
      ),
      power: httpHeader.get("power") === "on",
      brightness: parseInt(httpHeader.get("bright") || "0", 10),
      colorMode: httpHeader.get("color_mode") || "normal",
      colorTemperature: httpHeader.has("ct")
        ? parseInt(httpHeader.get("ct")!, 10)
        : null,
      rgb: httpHeader.has("rgb") ? parseInt(httpHeader.get("rgb")!, 10) : null,
      hue: httpHeader.has("hue") ? parseInt(httpHeader.get("hue")!, 10) : null,
      saturation: httpHeader.has("sat")
        ? parseInt(httpHeader.get("sat")!, 10)
        : null,
    };
    if (
      !this._conf.id || !this._conf.location || !this._conf.ip ||
      !this._conf.port || !this._conf.model || !this._conf.firmwareVersion
    ) {
      throw new Error("Invalid configuration data received from device.");
    }
    return this._conf;
  }

  private async _getSocket(): Promise<Deno.TcpConn> {
    if (!this._socket || !this._socket.writable || !this._socket.readable) {
      this._socket?.close();
      this._socket = await Deno.connect({
        hostname: this._conf.ip,
        port: this._conf.port,
        transport: "tcp",
      }).catch((error) => {
        logger.error(
          `Failed to connect to device ${this._conf.name} (${this._conf.id}):`,
          error,
        );
        return null;
      });
      if (!this._socket) {
        throw new Error(
          `Failed to connect to device ${this._conf.name} (${this._conf.id}) at ${this._conf.ip}:${this._conf.port}`,
        );
      }
    }
    return this._socket;
  }

  async connect() {
    logger.log(`Connecting to device at ${this._conf.ip}:${this._conf.port}`);
    this._socket?.close();
    this._socket = await this._getSocket();
    logger.log("Connected successfully.");
    return this;
  }

  private _sendRequest(message: IMessage) {
    let id: number;
    if (this._queue.size >= 1000) {
      throw new Error(
        `Queue is full for device ${this._conf.name} (${this._conf.id}). Cannot process	 more requests.`,
      );
    }
    do id = Math.floor(Math.random() * 1000000); while (this._queue.has(id));
    message.id = id;
    const promise = new Promise(
      (resolve: (value: IMessageResponse) => void, reject) => {
        this._queue.set(message.id, [message, resolve]);
        this.socket.write(
          new TextEncoder().encode(JSON.stringify(message) + "\r\n"),
        ).then(() => {
          logger.log(
            `Request ${message.id}: ${message.method} [${message.params}] device ${this._conf.name} (${this._conf.id})`,
          );
        }).catch((error) => {
          logger.error(
            `Failed to send request to device ${this._conf.name} (${this._conf.id}):`,
            error,
          );
          reject(error);
        });
        setTimeout(() => {
          reject(
            new Error(
              `Timeout waiting for response from device ${this._conf.name} (${this._conf.id})`,
            ),
          );
        }, this._timeout);
      },
    );

    return promise;
  }

  async getProperties(
    properties: (keyof typeof Props)[],
  ): Promise<Record<keyof typeof Props, string | number>> {
    if (properties.length <= 0) {
      throw new Error("At least one property must be specified.");
    }

    const message: IMessage = {
      id: 0,
      method: Methods.get_prop,
      params: [...properties],
    };
    const resp = await this._sendRequest(message);
    const response: Record<string, string | number> = {};
    if (!resp.result) {
      return response;
    }
    for (let i = 0; i < properties.length && resp.result[i]; i++) {
      response[properties[i]] = resp.result[i];
    }
    return response;
  }

  setPower(props: SetPowerParams) {
    const message: IMessageSetPower = {
      id: 0,
      method: Methods.set_power,
      params: [
        props.power ? "on" : "off",
        props.effect || "smooth",
        props.duration === undefined ? 500 : props.duration,
        props.mode || 0,
      ],
    };

    return this._sendRequest(message);
  }

  setRgb(props: SetRgbParams) {
    if (props.rgb < 0 || props.rgb > 16777215) {
      throw new Error("RGB value must be between 0 and 16777215.");
    }
    const message: IMessageSetRgb = {
      id: 0,
      method: Methods.set_rgb,
      params: [
        props.rgb,
        props.effect || "smooth",
        props.duration === undefined ? 500 : props.duration,
      ],
    };

    return this._sendRequest(message);
  }

  setHsv(props: SetHsvParams) {
    if (props.hue < 0 || props.hue > 359) {
      throw new Error("Hue must be between 0 and 359.");
    }
    if (props.sat < 0 || props.sat > 100) {
      throw new Error("Saturation must be between 0 and 100.");
    }
    const message: IMessageSetHsv = {
      id: 0,
      method: Methods.set_hsv,
      params: [
        props.hue,
        props.sat,
        props.effect || "smooth",
        props.duration === undefined ? 500 : props.duration,
      ],
    };

    return this._sendRequest(message);
  }

  setBrightness(props: SetBrightParams) {
    if (props.bright < 1 || props.bright > 100) {
      throw new Error("Brightness must be between 1 and 100.");
    }

    const message: IMessage = {
      id: 0,
      method: Methods.set_bright,
      params: [
        props.bright,
        props.effect || "smooth",
        props.duration === undefined ? 500 : props.duration,
      ],
    };

    return this._sendRequest(message);
  }

  toggle() {
    const message: IMessageToggle = {
      id: 0,
      method: Methods.toggle,
      params: [],
    };
    return this._sendRequest(message);
  }

  get isHealthy(): boolean {
    // Placeholder for health check logic
    return true; // Assume the device is healthy for now
  }

  get deviceInfo(): IDeviceManagerConfig {
    return this._conf;
  }

  get socket(): Deno.TcpConn {
    if (!this._socket) {
      throw new Error("Socket is not initialized. Call connect() first.");
    }
    if (!this._socket.writable || !this._socket.readable) {
      throw new Error("Socket is not writable or readable.");
    }
    return this._socket;
  }
}

export default DeviceManager;
