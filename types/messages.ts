/**
 * Interface representing a message in the Yeelight protocol.
 * This interface is used to define the structure of messages sent to and received from Yeelight devices.
 * It includes the message ID, method name, and parameters for the request.
 */
export interface IMessage {
    /**
     * Unique identifier for the message pair.
     * This is used to match requests and responses.
     * It should be a number that is unique for each request.
     *
     * @see {@link https://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf#page=9|Yeelight Inter-Operation Specification}
     */
    id: number;
    /**
     * Method name for the request.
     * This should be a string that represents the method being called.
     *
     * The method should be a valid Yeelight method to the device. Available methods for specific device are listed in the DeviceManager support property.
     *
     * A list of methods for the device is available on the Yeelight Inter-Operation Specification.
     *
     * Example: "set_power"
     * @see {@link https://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf#page=10|Yeelight Inter-Operation Specification}
     */
    method: keyof typeof Methods;
    /**
     * Parameters for the request.
     * This should be an array of strings representing the parameters for the method.
     *
     * A list of parameters for the method being called is available on the Yeelight Inter-Operation Specification.
     *
     * @see {@link https://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf#page=10|Yeelight Inter-Operation Specification}
     */
    params: (string | number)[];
}

export interface IMessageResponse {
    /**
     * Unique identifier for the message pair.
     * This is used to match requests and responses.
     * It should be a number that is unique for each request.
     *
     * @see {@link https://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf#page=9|Yeelight Inter-Operation Specification}
     */
    id: number;
    result?: (string | number)[];
}

export enum Props {
    power = "power",
    bright = "bright",
    ct = "ct",
    rgb = "rgb",
    hue = "hue",
    sat = "sat",
    color_mode = "color_mode",
    flowing = "flowing",
    delayoff = "delayoff",
    flow_params = "flow_params",
    music_on = "music_on",
    name = "name",
    bg_power = "bg_power",
    bg_flowing = "bg_flowing",
    bg_flow_params = "bg_flow_params",
    bg_ct = "bg_ct",
    bg_lmode = "bg_lmode",
    bg_bright = "bg_bright",
    bg_rgb = "bg_rgb",
    bg_hue = "bg_hue",
    bg_sat = "bg_sat",
    nl_br = "nl_br",
    active_mode = "active_mode",
}

export enum Methods {
    get_prop = "get_prop",
    set_ct_abx = "set_ct_abx",
    set_rgb = "set_rgb",
    set_hsv = "set_hsv",
    set_bright = "set_bright",
    set_power = "set_power",
    toggle = "toggle",
    set_default = "set_default",
    start_cf = "start_cf",
    stop_cf = "stop_cf",
    set_scene = "set_scene",
    cron_add = "cron_add",
    cron_get = "cron_get",
    cron_del = "cron_del",
    set_adjust = "set_adjust",
    set_music = "set_music",
    set_name = "set_name",
    bg_set_rgb = "bg_set_rgb",
    bg_set_hsv = "bg_set_hsv",
    bg_set_ct_abx = "bg_set_ct_abx",
    bg_start_cf = "bg_start_cf",
    bg_stop_cf = "bg_stop_cf",
    bg_set_scene = "bg_set_scene",
    bg_set_default = "bg_set_default",
    bg_set_power = "bg_set_power",
    bg_set_bright = "bg_set_bright",
    bg_set_adjust = "bg_set_adjust",
    bg_toggle = "bg_toggle",
    dev_toggle = "dev_toggle",
    adjust_bright = "adjust_bright",
    adjust_ct = "adjust_ct",
    adjust_color = "adjust_color",
    bg_adjust_bright = "bg_adjust_bright",
    bg_adjust_ct = "bg_adjust_ct",
}

export enum effects {
    smooth = "smooth",
    sudden = "sudden",
}

// get_prop message

export type GetPropParams = {
    method: Methods.get_prop;
    props: string[];
}

// set_rgb message

export type SetRgbParams = {
    rgb: number;
    effect?: keyof typeof effects;
    duration?: number;
}

export interface IMessageSetRgb extends IMessage {
    method: Methods.set_rgb;
}

// set_hsv message
export type SetHsvParams = {
    hue: number;
    sat: number;
    effect?: keyof typeof effects;
    duration?: number;
}

export interface IMessageSetHsv extends IMessage {
    method: Methods.set_hsv;
}

// st_bright message

export type SetBrightParams = {
    bright: number;
    effect?: keyof typeof effects;
    duration?: number;
}

export interface IMessageSetBright extends IMessage {
    method: Methods.set_bright;
}

// set_power message

export enum PowerMode {
    normal = 0,
    ctMode = 1,
    rgbMode = 2,
    hsvMode = 3,
    flowMode = 4,
    nightMode = 5,
}

export type SetPowerParams = {
    power: boolean;
    effect?: keyof typeof effects;
    duration?: number;
    mode?: keyof typeof PowerMode;
}

export interface IMessageSetPower extends IMessage {
    method: Methods.set_power;
}

// toggle message
export interface IMessageToggle extends IMessage {
    method: Methods.toggle;
}

export type paramsType = SetPowerParams | SetRgbParams;