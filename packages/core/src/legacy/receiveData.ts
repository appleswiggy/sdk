import {
  DeviceError,
  DeviceErrorType,
  IDeviceConnection
} from '@cypherock/sdk-interfaces';
import { PacketVersion } from '../utils/versions';
import { logger } from '../utils';
import { xmodemDecode, LegacyDecodedPacketData } from '../xmodem/legacy';
import { constants } from '../config';

const DEFAULT_RECEIVE_TIMEOUT = 15000;

/**
 * waits for the hardware to send a message with one of the specified command numbers and returns the data in hex
 */
// eslint-disable-next-line
export const receiveCommand = (
  connection: IDeviceConnection,
  allAcceptableCommands: number[],
  version: PacketVersion,
  timeout: number = DEFAULT_RECEIVE_TIMEOUT
) => {
  const resData: any = [];

  if (!connection.isConnected()) {
    throw new DeviceError(DeviceErrorType.CONNECTION_CLOSED);
  }

  return new Promise<{ commandType: number; data: string }>(
    (resolve, reject) => {
      if (!connection.isConnected()) {
        reject(new DeviceError(DeviceErrorType.NOT_CONNECTED));
        return;
      }

      let timeoutIdentifier: NodeJS.Timeout | null = null;
      let recheckTimeout: NodeJS.Timeout | null = null;

      function cleanUp() {
        if (timeoutIdentifier) {
          clearTimeout(timeoutIdentifier);
        }
        if (recheckTimeout) {
          clearTimeout(recheckTimeout);
        }
      }

      if (timeout) {
        timeoutIdentifier = setTimeout(() => {
          cleanUp();
          reject(new DeviceError(DeviceErrorType.READ_TIMEOUT));
        }, timeout);
      }

      function processPacket(packet: LegacyDecodedPacketData) {
        const { commandType, currentPacketNumber, totalPacket, dataChunk } =
          packet;
        if (allAcceptableCommands.includes(commandType)) {
          resData[currentPacketNumber - 1] = dataChunk;
          if (currentPacketNumber === totalPacket) {
            if (commandType === 49) {
              logger.info(`Received command (${commandType})`);
              logger.debug(
                `Received command (${commandType}) : ${resData.join('')}`
              );
            } else {
              logger.info(
                `Received command (${commandType}) : ${resData.join('')}`
              );
            }
            cleanUp();
            resolve({ commandType, data: resData.join('') });
            return true;
          }
        }

        return false;
      }

      async function recheckPacket() {
        try {
          logger.info('Recheck triggred for receive');
          if (!connection.isConnected()) {
            reject(new DeviceError(DeviceErrorType.CONNECTION_CLOSED));
            return;
          }

          const data = await connection.receive();
          logger.info(`Received: ${data}`);
          if (!data) {
            recheckTimeout = setTimeout(
              recheckPacket,
              constants.default.RECHECK_TIME
            );
            return;
          }

          const packetList = xmodemDecode(data, version);
          let isDone = false;

          // eslint-disable-next-line
          for (const packet of packetList) {
            isDone = processPacket(packet);
            if (isDone) break;
          }

          if (!isDone) {
            recheckTimeout = setTimeout(
              recheckPacket,
              constants.default.RECHECK_TIME
            );
          }
        } catch (error) {
          cleanUp();
          reject(new DeviceError(DeviceErrorType.UNKNOWN_COMMUNICATION_ERROR));
        }
      }

      recheckTimeout = setTimeout(
        recheckPacket,
        constants.default.RECHECK_TIME
      );
    }
  );
};
