const ProtoCoder = require('../index');

let zpc;

const _fnName = 'test';
const _module = 'sample';

const resultHex = '0a120a03666f6f12036261721a04626565722001';
const paramHex = '0a07746573745f6964121c0a050a03666f6f120f0a036261721208626172206e616d651a020800';
const foobarHex = '0a036261721203666f6f'; // { foo: 'bar', bar: 'foo' }

const result = {
  _id: 'foo',
  user: 'bar',
  role: 'beer',
  active: true,
};

const params = {
  _id: 'test_id',
  meta: {
    foo: { _id: 'foo' },
    bar: { _id: 'bar', name: 'bar name' },
    beer: { flag: false },
  },
};

describe('zCoder Test', () => {
  beforeAll(() => {
    zpc = new ProtoCoder('./tests');
  });

  it('should encode params', async () => {
    const ret = await zpc.paramEncode(_module, _fnName, params);
    expect(ret.toString('hex')).toBe(paramHex);
  });

  it('should decode params', async () => {
    const encodedBuf = Buffer.from(paramHex, 'hex');
    const decoded = await zpc.paramDecode(_module, _fnName, [encodedBuf]);

    expect(decoded[0]).toBe(params._id);
    expect(decoded[1]).toEqual(params.meta);
  });

  it('should encode result', async () => {
    const ret = await zpc.resultEncode(_module, _fnName, result);
    expect(ret.toString('hex')).toBe(resultHex);
  });

  it('should decode result', async () => {
    const encodedBuf = Buffer.from(resultHex, 'hex');
    const ret = await zpc.resultDecode(_module, _fnName, encodedBuf);

    expect(ret.result).toEqual(result);
  });

  it('should catch decode error', async () => {
    const foobarBuf = Buffer.from(foobarHex, 'hex');
    await expect(zpc.resultDecode(_module, _fnName, foobarBuf)).rejects.toThrow(Error);
  });
});
