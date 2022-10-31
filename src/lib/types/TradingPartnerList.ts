// https://quicktype.io/typescript generated type for trading partner configuration list
// To parse this data:
//
//   import { Convert, TradingPartnerList, Item, TradingPartnerConfig, ExternalSFTPConfig, ResourceIDS } from "./file";
//
//   const tradingPartnerList = Convert.toTradingPartnerList(json);
//   const item = Convert.toItem(json);
//   const tradingPartnerConfig = Convert.toTradingPartnerConfig(json);
//   const externalSFTPConfig = Convert.toExternalSFTPConfig(json);
//   const resourceIDS = Convert.toResourceIDS(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface TradingPartnerList {
    items: Item[];
}

export interface Item {
    key:   string;
    value: TradingPartnerConfig;
}

export interface TradingPartnerConfig {
    additionalConfig:    any;
    externalSftpConfig?: ExternalSFTPConfig;
    myPartnershipId:     string;
    name:                string;
    resourceIds?:        ResourceIDS;
}

export interface ExternalSFTPConfig {
    hostname:      string;
    inboundPath?:  string;
    outboundPath?: string;
    password:      string;
    port?:         number;
    username:      string;
}

export interface ResourceIDS {
    guideId?:   string;
    mappingId?: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTradingPartnerList(json: string): TradingPartnerList {
        return cast(JSON.parse(json), r("TradingPartnerList"));
    }

    public static tradingPartnerListToJson(value: TradingPartnerList): string {
        return JSON.stringify(uncast(value, r("TradingPartnerList")), null, 2);
    }

    public static toItem(json: string): Item {
        return cast(JSON.parse(json), r("Item"));
    }

    public static itemToJson(value: Item): string {
        return JSON.stringify(uncast(value, r("Item")), null, 2);
    }

    public static toTradingPartnerConfig(json: string): TradingPartnerConfig {
        return cast(JSON.parse(json), r("TradingPartnerConfig"));
    }

    public static tradingPartnerConfigToJson(value: TradingPartnerConfig): string {
        return JSON.stringify(uncast(value, r("TradingPartnerConfig")), null, 2);
    }

    public static toExternalSFTPConfig(json: string): ExternalSFTPConfig {
        return cast(JSON.parse(json), r("ExternalSFTPConfig"));
    }

    public static externalSFTPConfigToJson(value: ExternalSFTPConfig): string {
        return JSON.stringify(uncast(value, r("ExternalSFTPConfig")), null, 2);
    }

    public static toResourceIDS(json: string): ResourceIDS {
        return cast(JSON.parse(json), r("ResourceIDS"));
    }

    public static resourceIDSToJson(value: ResourceIDS): string {
        return JSON.stringify(uncast(value, r("ResourceIDS")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "TradingPartnerList": o([
        { json: "items", js: "items", typ: a(r("Item")) },
    ], "any"),
    "Item": o([
        { json: "key", js: "key", typ: "" },
        { json: "value", js: "value", typ: r("TradingPartnerConfig") },
    ], "any"),
    "TradingPartnerConfig": o([
        { json: "additionalConfig", js: "additionalConfig", typ: "any" },
        { json: "externalSftpConfig", js: "externalSftpConfig", typ: u(undefined, r("ExternalSFTPConfig")) },
        { json: "myPartnershipId", js: "myPartnershipId", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "resourceIds", js: "resourceIds", typ: u(undefined, r("ResourceIDS")) },
    ], "any"),
    "ExternalSFTPConfig": o([
        { json: "hostname", js: "hostname", typ: "" },
        { json: "inboundPath", js: "inboundPath", typ: u(undefined, "") },
        { json: "outboundPath", js: "outboundPath", typ: u(undefined, "") },
        { json: "password", js: "password", typ: "" },
        { json: "port", js: "port", typ: u(undefined, 3.14) },
        { json: "username", js: "username", typ: "" },
    ], "any"),
    "ResourceIDS": o([
        { json: "guideId", js: "guideId", typ: u(undefined, "") },
        { json: "mappingId", js: "mappingId", typ: u(undefined, "") },
    ], "any"),
};
