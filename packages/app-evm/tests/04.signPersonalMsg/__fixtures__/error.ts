import {
  DeviceAppError,
  DeviceAppErrorType,
  deviceAppErrorTypeDetails,
} from '@cypherock/sdk-interfaces';
import { ISignPersonalMsgTestCase } from './types';

const commonParams = {
  params: {
    walletId: new Uint8Array([
      199, 89, 252, 26, 32, 135, 183, 211, 90, 220, 38, 17, 160, 103, 233, 62,
      110, 172, 92, 20, 35, 250, 190, 146, 62, 8, 53, 86, 128, 26, 3, 187, 121,
      64,
    ]),
    derivationPath: [
      { index: 44, isHardened: true },
      { index: 60, isHardened: true },
      { index: 0, isHardened: true },
      { index: 0, isHardened: false },
      { index: 0, isHardened: false },
    ],
    message: new Uint8Array([
      116, 101, 115, 116, 105, 110, 103, 32, 116, 101, 120, 116, 32, 102, 111,
      114, 32, 115, 105, 103, 110, 105, 110, 103, 32, 112, 101, 114, 115, 111,
      110, 97, 108, 32, 109, 101, 115, 115, 97, 103, 101,
    ]),
  },
  queries: [
    {
      name: 'Initate query',
      data: new Uint8Array([
        26, 64, 10, 62, 10, 34, 199, 89, 252, 26, 32, 135, 183, 211, 90, 220,
        38, 17, 160, 103, 233, 62, 110, 172, 92, 20, 35, 250, 190, 146, 62, 8,
        53, 86, 128, 26, 3, 187, 121, 64, 18, 4, 8, 44, 16, 1, 18, 4, 8, 60, 16,
        1, 18, 2, 16, 1, 18, 2, 16, 0, 18, 2, 16, 0, 24, 1,
      ]),
    },
  ],
};

const withUnknownError: ISignPersonalMsgTestCase = {
  name: 'With unknown error',
  ...commonParams,
  results: [
    {
      name: 'error',
      data: new Uint8Array([26, 4, 26, 2, 8, 1]),
    },
  ],
  errorInstance: DeviceAppError,
  errorMessage: deviceAppErrorTypeDetails[DeviceAppErrorType.UNKNOWN_ERROR],
};

const withInvalidResult: ISignPersonalMsgTestCase = {
  name: 'With invalid result',
  ...commonParams,
  results: [
    {
      name: 'error',
      data: new Uint8Array([26, 4, 26, 2, 24, 1]),
    },
  ],
  errorInstance: DeviceAppError,
  errorMessage:
    deviceAppErrorTypeDetails[DeviceAppErrorType.INVALID_RESULT_ON_DEVICE],
};

const error: ISignPersonalMsgTestCase[] = [withUnknownError, withInvalidResult];

export default error;
