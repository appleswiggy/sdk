import { ISDK } from '@cypherock/sdk-core';
import { createLoggerWithPrefix } from '@cypherock/sdk-utils';
import { APP_VERSION } from '../../constants/appId';
import { IGetRandomNonceResultResponse } from '../../proto/generated/types';
import {
  assertOrThrowInvalidResult,
  OperationHelper,
  logger as rootLogger,
} from '../../utils';

const logger = createLoggerWithPrefix(rootLogger, 'GetRandomNonce');

export const getRandomNonce = async (
  sdk: ISDK,
): Promise<IGetRandomNonceResultResponse> => {
  logger.info('Started');
  await sdk.checkAppCompatibility(APP_VERSION);

  const helper = new OperationHelper(sdk, 'getRandomNonce', 'getRandomNonce');

  await helper.sendQuery({ initiate: {} });
  const result = await helper.waitForResult();
  logger.verbose('GetRandomNonceResponse', { result });
  assertOrThrowInvalidResult(result.result);

  logger.info('Completed');
  return result.result;
};
