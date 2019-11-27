import { SetStateAction, Dispatch, useReducer } from 'react'
import { toast } from 'react-toastify'
import BN from 'bn.js'

import { depositApi, erc20Api } from 'api'
import { Mutation, TokenBalanceDetails } from 'types'
import { ALLOWANCE_MAX_VALUE, ZERO } from 'const'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { formatAmount, formatAmountFull, log, getToken } from 'utils'
import { txOptionalParams } from 'utils/transaction'

/************************************************************** */
// Reducer specific typings

export interface TokenLocalState {
  enabling: Set<string>
  highlighted: Set<string>
  claiming: Set<string>
}

const enum ActionTypes {
  SET_ENABLING = 'enabling',
  SET_CLAIMING = 'claiming',
  SET_HIGHLIGHTED = 'highlighted',
  SET_HIGHLIGHTED_AND_CLAIMING = 'highlighted_and_claiming',
}

interface Actions {
  type: ActionTypes
  payload: string
}

const initialState: TokenLocalState = {
  enabling: new Set(),
  highlighted: new Set(),
  claiming: new Set(),
}

const reducer = (state: TokenLocalState, action: Actions): TokenLocalState => {
  switch (action.type) {
    case ActionTypes.SET_ENABLING:
    case ActionTypes.SET_CLAIMING:
    case ActionTypes.SET_HIGHLIGHTED: {
      const newSet = new Set(state[action.type])
      return {
        ...state,
        [action.type]: newSet.has(action.payload)
          ? newSet.delete(action.payload) && newSet
          : newSet.add(action.payload),
      }
    }
    case ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING: {
      const newClaimingSet = new Set(state.claiming)
      const newHighlightedSet = new Set(state.highlighted)
      return {
        ...state,
        claiming: newClaimingSet.has(action.payload)
          ? newClaimingSet.delete(action.payload) && newClaimingSet
          : newClaimingSet.add(action.payload),
        highlighted: newHighlightedSet.has(action.payload)
          ? newHighlightedSet.delete(action.payload) && newHighlightedSet
          : newHighlightedSet.add(action.payload),
      }
    }
    default:
      return state
  }
}

/************************************************************** */
// useRowActions specific typings

interface Params {
  balances: TokenBalanceDetails[]
  setBalances: Dispatch<SetStateAction<TokenBalanceDetails[]>>
}

interface Result extends TokenLocalState {
  enableToken: (tokenAddress: string) => Promise<void>
  depositToken: (amount: BN, tokenAddress: string) => Promise<void>
  requestWithdrawToken: (amount: BN, tokenAddress: string) => Promise<void>
  claimToken: (tokenAddress: string) => Promise<void>
}

export const useRowActions = (params: Params): Result => {
  const { balances, setBalances } = params

  const [state, dispatch] = useReducer(reducer, initialState)

  const { userAddress, networkId } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress(networkId)

  function _updateToken(tokenAddress: string, updateBalances: Mutation<TokenBalanceDetails>): void {
    setBalances(balances =>
      balances.map(tokenBalancesAux => {
        const { address: tokenAddressAux } = tokenBalancesAux
        return tokenAddressAux === tokenAddress ? updateBalances(tokenBalancesAux) : tokenBalancesAux
      }),
    )
  }

  async function enableToken(tokenAddress: string): Promise<void> {
    const { symbol } = getToken('address', tokenAddress, balances)
    try {
      dispatch({
        type: ActionTypes.SET_ENABLING,
        payload: tokenAddress,
      })

      const receipt = await erc20Api.approve(
        { userAddress, tokenAddress, spenderAddress: contractAddress, amount: ALLOWANCE_MAX_VALUE },
        txOptionalParams,
      )
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          enabled: true,
        }
      })
      toast.success(`The token ${symbol} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
    } finally {
      dispatch({
        type: ActionTypes.SET_ENABLING,
        payload: tokenAddress,
      })
    }
  }

  async function depositToken(amount: BN, tokenAddress: string): Promise<void> {
    try {
      const { symbol, decimals } = getToken('address', tokenAddress, balances)

      dispatch({
        type: ActionTypes.SET_HIGHLIGHTED,
        payload: tokenAddress,
      })

      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.deposit({ userAddress, tokenAddress, amount }, txOptionalParams)
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, ({ depositingBalance, walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          depositingBalance: depositingBalance.add(amount),
          walletBalance: walletBalance.sub(amount),
        }
      })

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    } finally {
      dispatch({
        type: ActionTypes.SET_HIGHLIGHTED,
        payload: tokenAddress,
      })
    }
  }

  async function requestWithdrawToken(amount: BN, tokenAddress: string): Promise<void> {
    const { symbol, decimals } = getToken('address', tokenAddress, balances)
    try {
      dispatch({
        type: ActionTypes.SET_HIGHLIGHTED,
        payload: tokenAddress,
      })

      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.requestWithdraw({ userAddress, tokenAddress, amount }, txOptionalParams)
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          withdrawingBalance: amount,
        }
      })

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    } finally {
      dispatch({
        type: ActionTypes.SET_HIGHLIGHTED,
        payload: tokenAddress,
      })
    }
  }

  async function claimToken(tokenAddress: string): Promise<void> {
    const { withdrawingBalance, symbol, decimals } = getToken('address', tokenAddress, balances)
    try {
      console.debug(`Starting the withdraw for ${formatAmountFull(withdrawingBalance, decimals)} of ${symbol}`)

      dispatch({
        type: ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING,
        payload: tokenAddress,
      })

      const receipt = await depositApi.withdraw({ userAddress, tokenAddress }, txOptionalParams)

      _updateToken(tokenAddress, ({ exchangeBalance, walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          exchangeBalance: exchangeBalance.sub(withdrawingBalance),
          withdrawingBalance: ZERO,
          walletBalance: walletBalance.add(withdrawingBalance),
          claimable: false,
        }
      })

      log(`The transaction has been mined: ${receipt.transactionHash}`)
      toast.success(`Withdraw of ${formatAmount(withdrawingBalance, decimals)} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    } finally {
      dispatch({
        type: ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING,
        payload: tokenAddress,
      })
    }
  }

  return {
    enableToken,
    depositToken,
    requestWithdrawToken,
    claimToken,
    enabling: state.enabling,
    claiming: state.claiming,
    highlighted: state.highlighted,
  }
}
