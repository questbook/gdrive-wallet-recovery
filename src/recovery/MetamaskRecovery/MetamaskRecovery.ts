import { ethers, Wallet } from "ethers";
import { concat, entropyToMnemonic, keccak256 } from "ethers/lib/utils";
import { RecoveryMechanism } from "../types";
import { MetamaskRecoveryMechanismOption } from "./types";

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

  _generateWalletFromString(seed: string): ethers.Wallet {
    const mnemonic = entropyToMnemonic(seed);
    return Wallet.fromMnemonic(mnemonic);
  }

  _hashSignedMessage(signedMessage: string): string {
    const hashedString = keccak256(concat([signedMessage]));
    return hashedString;
  }

  async _signWithMetamask(message: string): Promise<string> {
    // @ts-ignore
    if (!window.ethereum) throw new Error("Couldn't connect to Metamask")

    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const signedMessage = await signer.signMessage(message)
    return signedMessage;
  }

  async _getNewZeroWalletMetamask() {
    const signedMessage = await this._signWithMetamask(MESSAGE);
    const hash = this._hashSignedMessage(signedMessage);
    const newZeroWallet = this._generateWalletFromString(hash);
    return newZeroWallet;
  }

  async _changeScwOwner(
    oldWallet: ethers.Wallet,
    newWallet: ethers.Wallet
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
