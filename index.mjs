/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable security/detect-object-injection */

import protobuf from 'protobufjs';

import { basename } from 'path';
import { globbySync } from 'globby';

class ProtoCoder {
  constructor(protoSrc) {
    this.protoSrc = protoSrc;
    this.protoRoot = new Map();
  }

  async loadProtos() {
    for (const protoPath of globbySync(`${this.protoSrc}/*.proto`)) {
      const filename = basename(protoPath);
      const root = await protobuf.load(`${this.protoSrc}/${filename}`);

      this.protoRoot.set(filename, root);
    }
  }

  async paramDecode(module, fnName, arrParams) {
    const filename = `${module}.proto`;
    const root = this.protoRoot.get(filename) || await protobuf.load(`${this.protoSrc}/${filename}`);
    const proto = root.lookupType(`${module}.${fnName}`);

    const msg = proto.decode(arrParams[0]);
    const msgObj = proto.toObject(msg);

    return Object.keys(msgObj).map((key) => msgObj[key]);
  }

  async paramEncode(module, fnName, objParams) {
    const filename = `${module}.proto`;
    const root = this.protoRoot.get(filename) || await protobuf.load(`${this.protoSrc}/${filename}`);
    const proto = root.lookupType(`${module}.${fnName}`);

    const errMsg = proto.verify(objParams);
    if (errMsg) throw Error(errMsg);

    const msg = proto.create(objParams);
    const buf = proto.encode(msg).finish();

    return buf;
  }

  async resultEncode(module, fnName, result) {
    const filename = `${module}.proto`;
    const root = this.protoRoot.get(filename) || await protobuf.load(`${this.protoSrc}/${filename}`);
    const proto = root.lookupType(`${module}.${fnName}Result`);

    const errMsg = proto.verify({ result });

    if (errMsg) {
      throw Error(errMsg);
    }

    const msg = proto.create({ result });
    const buf = proto.encode(msg).finish();

    return buf;
  }

  async resultDecode(module, fnName, bufResult) {
    const lookup = `${module}.${fnName}Result`;
    const filename = `${module}.proto`;

    const root = this.protoRoot.get(filename) || await protobuf.load(`${this.protoSrc}/${filename}`);
    const proto = root.lookupType(lookup);

    try {
      const msg = proto.decode(bufResult);
      return proto.toObject(msg);
    } catch (err) {
      if (err instanceof protobuf.util.ProtocolError) {
        throw new Error(`Decoded message with missing required fields! Lookup: '${lookup}'`);
      } else {
        throw new Error(`Invalid wire format! Lookup: '${lookup}'`);
      }
    }
  }
}

export default ProtoCoder;
