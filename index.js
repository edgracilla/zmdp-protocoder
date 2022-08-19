const protobuf = require('protobufjs')

class ProtoCoder {
  constructor (protoSrc) {
    this.protoSrc = protoSrc
  }

  async paramDecode (module, fnName, arrParams) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}`)
    const msg = proto.decode(arrParams[0])
    const msgObj = proto.toObject(msg)

    return Object.keys(msgObj).map(key => msgObj[key])
  }

  async resultEncode (module, fnName, result) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}Result`)

    const errMsg = proto.verify({ result })

    if (errMsg) {
      throw Error(errMsg)
    }

    const msg = proto.create({ result })
    const buf = proto.encode(msg).finish()

    return buf
  }

  async paramEncode (module, fnName, objParams) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}`)
    
    const errMsg = proto.verify(objParams)
    if (errMsg) throw Error(errMsg)

    const msg = proto.create(objParams)
    const buf = proto.encode(msg).finish()

    return buf
  }

  async resultDecode (module, fnName, bufResult) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}Result`)
    const msg = proto.decode(bufResult)

    return proto.toObject(msg)
  }
}

module.exports = ProtoCoder
