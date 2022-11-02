import { providers, Wallet } from "ethers";
import { arrayify, concat, entropyToMnemonic, keccak256 } from "ethers/lib/utils";
import { RecoveryMechanism } from "../types";
import { MetamaskRecoveryMechanismOption } from "./types";
import { toUtf8Bytes } from "@ethersproject/strings";


const MESSAGE = "recover-questbook";

export default class MetamaskRecovery implements RecoveryMechanism {
  constructor(options: MetamaskRecoveryMechanismOption) {}

  recoveryReadyPromise(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  isRecoveryReady(): boolean {
    return true;
  }

  _generateWalletFromString(seed: string): Wallet {
    const mnemonic = entropyToMnemonic(seed);
    return Wallet.fromMnemonic(mnemonic);
  }

  _hashMessage(message: string): string {    
    const hashedString = keccak256(toUtf8Bytes(message));
    return hashedString;
  }

  async _signWithMetamask(message: string): Promise<string> {
    // @ts-ignore
    if (!window.ethereum) throw new Error("Couldn't connect to Metamask")

    // @ts-ignore
    const provider = new providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const signedMessage = await signer.signMessage(arrayify(message))
    return signedMessage;
  }

  async _getNewZeroWalletMetamask() {
    const hashedMessage = this._hashMessage(MESSAGE);
    const signedMessage = await this._signWithMetamask(hashedMessage);
    const hashedSignedMessage = this._hashMessage(signedMessage);
    const newZeroWallet = this._generateWalletFromString(hashedSignedMessage);
    return newZeroWallet;
  }

  async _changeScwOwner(
    oldWallet: Wallet,
    newWallet: Wallet
  ): Promise<void> {
    // @TODO: handle changing the owner with Biconomy from the
    // old wallet to the new one.
    // throw new Error("Method not implemented.");
  }

  async setupRecovery(wallet: Wallet): Promise<void> {
    const newZeroWallet = await this._getNewZeroWalletMetamask();
    await this._changeScwOwner(wallet, newZeroWallet);
  }

  async initiateRecovery(keyId?: number | undefined): Promise<Wallet> {
    const newZeroWallet = await this._getNewZeroWalletMetamask();
    return newZeroWallet;
  }
}
