import fs from 'fs'
import protobuf from 'protobufjs'

export default class ProtoCoder {
  constructor (protoSrc) {
    this.protoSrc = protoSrc

    if (!fs.existsSync(protoSrc)) {
      throw Error('protoSrc file not found!')
    }
  }

  async paramDecoder (module, fnName, arrParams) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}`)
    const msg = proto.decode(arrParams[0])
    const msgObj = proto.toObject(msg)

    return Object.keys(msgObj).map(key => msgObj[key])
  }

  async resultEncoder (module, fnName, result) {
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

  async paramEncoder (module, fnName, objParams) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}`)
    
    const errMsg = proto.verify(objParams)
    if (errMsg) throw Error(errMsg)

    const msg = proto.create(payload)
    const buf = proto.encode(msg).finish()

    return buf
  }

  async resultDecoder (module, fnName, bufResult) {
    const root = await protobuf.load(`${this.protoSrc}/${module}.proto`)
    const proto = root.lookupType(`${module}.${fnName}Result`)
    const msg = proto.decode(bufResult)

    return paramProto.toObject(msg)
  }
}