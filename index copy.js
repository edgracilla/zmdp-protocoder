const protobuf = require('protobufjs');

class ProtoCoder {
  constructor(protoSrc) {
    this.protoSrc = protoSrc;
  }

  async paramDecode(module, fnName, arrParams) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`);
    const proto = root.lookupType(`${module}.${fnName}`);
    const msg = proto.decode(arrParams[0]);
    const msgObj = proto.toObject(msg);

    // eslint-disable-next-line security/detect-object-injection
    return Object.keys(msgObj).map((key) => msgObj[key]);
  }

  async paramEncode(module, fnName, objParams) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`);
    const proto = root.lookupType(`${module}.${fnName}`);

    const errMsg = proto.verify(objParams);
    if (errMsg) throw Error(errMsg);

    const msg = proto.create(objParams);
    const buf = proto.encode(msg).finish();

    return buf;
  }

  async resultEncode(module, fnName, result) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`);
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
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`);
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

module.exports = ProtoCoder;
