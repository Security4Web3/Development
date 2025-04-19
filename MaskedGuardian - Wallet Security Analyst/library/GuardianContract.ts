import { getContract } from 'wagmi/actions';
import abi from '../contracts/MaskedGuardianABI.json';

export const guardianContract = getContract({
  address: '0xce9B0A9615dc8C912f2ff0531D1cf166AeaB2838',
  abi,
});
