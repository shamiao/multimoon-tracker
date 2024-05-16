// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.176.0
//   protoc               v5.26.1
// source: toolchain.proto

/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import Long = require("long");

export const protobufPackage = "multimoon";

export interface File {
  filename: string;
  downloadfrom: string;
  checksum: string;
  uploadContent: Uint8Array;
}

export interface Toolchain {
  name: string;
  installer: string;
  lastModified: number;
  bin: File[];
  core: File[];
}

function createBaseFile(): File {
  return { filename: "", downloadfrom: "", checksum: "", uploadContent: new Uint8Array(0) };
}

export const File = {
  encode(message: File, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.filename !== "") {
      writer.uint32(10).string(message.filename);
    }
    if (message.downloadfrom !== "") {
      writer.uint32(18).string(message.downloadfrom);
    }
    if (message.checksum !== "") {
      writer.uint32(26).string(message.checksum);
    }
    if (message.uploadContent.length !== 0) {
      writer.uint32(34).bytes(message.uploadContent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): File {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.filename = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.downloadfrom = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.checksum = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.uploadContent = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): File {
    return {
      filename: isSet(object.filename) ? globalThis.String(object.filename) : "",
      downloadfrom: isSet(object.downloadfrom) ? globalThis.String(object.downloadfrom) : "",
      checksum: isSet(object.checksum) ? globalThis.String(object.checksum) : "",
      uploadContent: isSet(object.uploadContent) ? bytesFromBase64(object.uploadContent) : new Uint8Array(0),
    };
  },

  toJSON(message: File): unknown {
    const obj: any = {};
    if (message.filename !== "") {
      obj.filename = message.filename;
    }
    if (message.downloadfrom !== "") {
      obj.downloadfrom = message.downloadfrom;
    }
    if (message.checksum !== "") {
      obj.checksum = message.checksum;
    }
    if (message.uploadContent.length !== 0) {
      obj.uploadContent = base64FromBytes(message.uploadContent);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<File>, I>>(base?: I): File {
    return File.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<File>, I>>(object: I): File {
    const message = createBaseFile();
    message.filename = object.filename ?? "";
    message.downloadfrom = object.downloadfrom ?? "";
    message.checksum = object.checksum ?? "";
    message.uploadContent = object.uploadContent ?? new Uint8Array(0);
    return message;
  },
};

function createBaseToolchain(): Toolchain {
  return { name: "", installer: "", lastModified: 0, bin: [], core: [] };
}

export const Toolchain = {
  encode(message: Toolchain, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.installer !== "") {
      writer.uint32(18).string(message.installer);
    }
    if (message.lastModified !== 0) {
      writer.uint32(24).int64(message.lastModified);
    }
    for (const v of message.bin) {
      File.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.core) {
      File.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Toolchain {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseToolchain();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.installer = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.lastModified = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.bin.push(File.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.core.push(File.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Toolchain {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      installer: isSet(object.installer) ? globalThis.String(object.installer) : "",
      lastModified: isSet(object.lastModified) ? globalThis.Number(object.lastModified) : 0,
      bin: globalThis.Array.isArray(object?.bin) ? object.bin.map((e: any) => File.fromJSON(e)) : [],
      core: globalThis.Array.isArray(object?.core) ? object.core.map((e: any) => File.fromJSON(e)) : [],
    };
  },

  toJSON(message: Toolchain): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.installer !== "") {
      obj.installer = message.installer;
    }
    if (message.lastModified !== 0) {
      obj.lastModified = Math.round(message.lastModified);
    }
    if (message.bin?.length) {
      obj.bin = message.bin.map((e) => File.toJSON(e));
    }
    if (message.core?.length) {
      obj.core = message.core.map((e) => File.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Toolchain>, I>>(base?: I): Toolchain {
    return Toolchain.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Toolchain>, I>>(object: I): Toolchain {
    const message = createBaseToolchain();
    message.name = object.name ?? "";
    message.installer = object.installer ?? "";
    message.lastModified = object.lastModified ?? 0;
    message.bin = object.bin?.map((e) => File.fromPartial(e)) || [];
    message.core = object.core?.map((e) => File.fromPartial(e)) || [];
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if ((globalThis as any).Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
