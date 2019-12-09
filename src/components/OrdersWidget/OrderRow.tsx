import React from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons'

import Highlight from 'components/Highlight'
import { EtherscanLink } from 'components/EtherscanLink'

import { TokenDetails, AuctionElement } from 'types'
import { safeTokenName, formatAmount, dateFromBatchId, addTimeToDate, formatAmountFull } from 'utils'
import { MIN_UNLIMITED_SELL_ORDER, MIN_UNLIMITED_SELL_ORDER_EXPIRATION_TIME } from 'const'

const OrderRowWrapper = styled.div`
  .container {
    display: grid;
    position: relative;
  }

  .order-details {
    grid-template-columns: 6em 3em 5em;
    grid-template-rows: repeat(2, 1fr);
    justify-self: start;
  }

  .sub-columns {
    gap: 0.5em;

    div:first-child {
      justify-self: end;
    }
  }

  .two-columns {
    grid-template-columns: repeat(2, 1fr);
  }

  .three-columns {
    grid-template-columns: minmax(4em, 60%) minmax(3em, 30%) minmax(1em, 10%);
  }

  .pendingCell {
    place-items: center;

    a {
      top: 100%;
      position: absolute;
    }
  }

  &.pending {
    color: grey;
  }
`

const PendingLink: React.FC<Pick<Props, 'pending'>> = ({ pending }) => {
  if (!pending) {
    return null
  }

  // TODO: use proper pending tx hash for link
  return (
    <div className="container pendingCell">
      <FontAwesomeIcon icon={faSpinner} size="lg" spin />
      <EtherscanLink identifier="bla" type="tx" label={<small>view</small>} />
    </div>
  )
}

const OrderDetails: React.FC<Pick<Props, 'buyToken' | 'sellToken' | 'pending'> & { price: string }> = ({
  price,
  buyToken,
  sellToken,
  pending,
}) => {
  return (
    <div className="container order-details">
      <div>Sell</div>
      <div>
        <Highlight color={pending ? 'grey' : ''}>1</Highlight>
      </div>
      <div>
        <strong>{safeTokenName(sellToken)}</strong>
      </div>

      <div>
        for <strong>at least</strong>
      </div>
      <div>
        <Highlight color={pending ? 'grey' : 'red'}>{price}</Highlight>
      </div>
      <div>
        <strong>{safeTokenName(buyToken)}</strong>
      </div>
    </div>
  )
}

const UnfilledAmount: React.FC<Pick<Props, 'sellToken' | 'pending'> & {
  unfilledAmount: string
  unlimited: boolean
}> = ({ sellToken, unfilledAmount, unlimited, pending }) => {
  return (
    <div className={'container' + (unlimited ? '' : ' sub-columns two-columns')}>
      {unlimited ? (
        <Highlight color={pending ? 'grey' : ''}>no limit</Highlight>
      ) : (
        <>
          <div>{unfilledAmount}</div>
          <div>
            <strong>{safeTokenName(sellToken)}</strong>
          </div>
        </>
      )}
    </div>
  )
}

const AvailableAmount: React.FC<Pick<Props, 'sellToken'> & {
  availableAmount: string
  overBalance: boolean
}> = ({ sellToken, availableAmount, overBalance }) => {
  return (
    <div className="container sub-columns three-columns">
      <div>{availableAmount}</div>
      <strong>{safeTokenName(sellToken)}</strong>
      {overBalance && (
        <div className="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
      )}
    </div>
  )
}

interface Props {
  sellToken: TokenDetails
  buyToken: TokenDetails
  order: AuctionElement
  pending?: boolean
}

function calculatePrice(_numerator?: string | null, _denominator?: string | null): string {
  if (!_numerator || !_denominator) {
    return 'N/A'
  }
  const numerator = new BigNumber(_numerator)
  const denominator = new BigNumber(_denominator)
  const price = numerator.dividedBy(denominator)
  return price.toFixed(2)
}

const OrderRow: React.FC<Props> = props => {
  const { buyToken, sellToken, order, pending = false } = props

  const price = calculatePrice(
    formatAmountFull(order.priceNumerator, buyToken.decimals, false),
    formatAmountFull(order.priceDenominator, sellToken.decimals, false),
  )
  const unfilledAmount = formatAmount(order.remainingAmount, sellToken.decimals) || '0'
  const availableAmount = formatAmount(order.sellTokenBalance, sellToken.decimals) || '0'
  const unlimitedAmount = order.priceDenominator.gt(MIN_UNLIMITED_SELL_ORDER)
  const overBalance = order.remainingAmount.gt(order.sellTokenBalance)
  const unlimitedTime =
    dateFromBatchId(order.validUntil).getTime() >=
    addTimeToDate(new Date(), MIN_UNLIMITED_SELL_ORDER_EXPIRATION_TIME, 'minute').getTime()
  const expiresOn = order.validUntil.toLocaleString() // TODO: make it nice like, 3 min, 1 day, etc

  return (
    <OrderRowWrapper className={'orderRow' + (pending ? ' pending' : '')}>
      <PendingLink {...props} />
      <div className="checked">
        <input type="checkbox" />
      </div>
      <OrderDetails {...props} price={price} />
      <UnfilledAmount {...props} unfilledAmount={unfilledAmount} unlimited={unlimitedAmount} />
      <AvailableAmount {...props} availableAmount={availableAmount} overBalance={overBalance} />
      <div className="cell">
        {unlimitedTime ? <Highlight color={pending ? 'grey' : ''}>Never</Highlight> : expiresOn}
      </div>
    </OrderRowWrapper>
  )
}

export default OrderRow
