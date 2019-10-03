import { Network, TokenList, WalletApi, DepositApi, Erc20Api } from 'types'
import { WalletApiMock } from './wallet/WalletApiMock'
import { TokenListApiImpl } from './tokenList/TokenListApiImpl'
import { TokenListApiMock } from './tokenList/TokenListApiMock'
import { Erc20ApiMock } from './erc20/Erc20ApiMock'
import { DepositApiMock } from './exchange/DepositApiMock'
import { tokenList, exchangeBalanceStates, erc20Balances, erc20Allowances } from '../../test/data'

const isMock = process.env.MOCK === 'true'

function createWalletApi(): WalletApi {
  let walletApi
  if (isMock) {
    const autoconnect = process.env.AUTOCONNECT === 'true'
    console.log('autoconnect', autoconnect)
    walletApi = new WalletApiMock()
    window['walletApi'] = walletApi // register for convenience
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
  return walletApi
}

function createTokenListApi(): TokenList {
  let tokenListApi
  if (isMock) {
    tokenListApi = new TokenListApiMock(tokenList)
    window['tokenListApi'] = tokenListApi // register for convenience
  } else {
    tokenListApi = new TokenListApiImpl([Network.Mainnet, Network.Rinkeby])
  }
  return tokenListApi
}

function createErc20Api(): Erc20Api {
  let erc20Api
  if (isMock) {
    erc20Api = new Erc20ApiMock({ balances: erc20Balances, allowances: erc20Allowances })
    window['erc20Api'] = erc20Api // register for convenience
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
  return erc20Api
}

function createDepositApi(erc20Api: Erc20Api): DepositApi {
  let depositApi
  if (isMock) {
    depositApi = new DepositApiMock(exchangeBalanceStates, erc20Api)
    window['depositApi'] = depositApi // register for convenience
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
  return depositApi
}

// Build APIs
export const walletApi: WalletApi = createWalletApi()
export const tokenListApi: TokenList = createTokenListApi()
export const erc20Api: Erc20Api = createErc20Api()
export const depositApi: DepositApi = createDepositApi(erc20Api)
