import { calculatePrice, formatPrice, invertPrice } from '@gnosis.pm/dex-js'
import React, { useMemo, useState } from 'react'
import BN from 'bn.js'
import { TokenDetails } from 'types'

import { SwapPrice } from 'components/common/SwapPrice'
import { getMarket } from 'utils'

interface Fraction {
  denominator: BN
  numerator: BN
}

interface Props {
  buyToken: TokenDetails
  sellToken: TokenDetails
  price: Fraction
}

export const SmartPrice: React.FC<Props> = ({ buyToken, sellToken, price: priceFraction }) => {
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  const { baseToken, quoteToken } = getMarket({ sellToken, receiveToken: buyToken })

  const [price, priceInverse] = useMemo((): string[] => {
    const buyOrderPrice = calculatePrice({
      numerator: { amount: priceFraction.numerator, decimals: buyToken.decimals },
      denominator: { amount: priceFraction.denominator, decimals: sellToken.decimals },
    })
    const buyOrderPriceInverse = invertPrice(buyOrderPrice)
    const sellTokenIsQuote = buyToken === quoteToken
    let price, priceInverse
    if (sellTokenIsQuote) {
      price = buyOrderPrice
      priceInverse = buyOrderPriceInverse
    } else {
      price = buyOrderPriceInverse
      priceInverse = buyOrderPrice
    }
    return [formatPrice(price), formatPrice(priceInverse)]
  }, [buyToken, sellToken, quoteToken, priceFraction])

  return (
    <span title="123.444 AAA per BBB">
      {isPriceInverted ? priceInverse : price}
      &nbsp;
      <SwapPrice
        baseToken={baseToken}
        quoteToken={quoteToken}
        isPriceInverted={isPriceInverted}
        onSwapPrices={(): void => setIsPriceInverted(!isPriceInverted)}
      />
    </span>
  )
}
