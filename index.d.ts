/// <reference types="node" />

export declare class ProtoCoder {
  protoSrc: string;
  constructor(protoSrc: string);

  paramDecode(module: string, fnName: string, arrParams: Buffer[]): Promise<any[]>;
  resultEncode(module: string, fnName: string, result: any): Promise<Buffer>;
  paramEncode(module: string, fnName: string, objParams: any): Promise<Buffer>;
  resultDecode(module: string, fnName: string, bufResult: Buffer): Promise<any>;
}
