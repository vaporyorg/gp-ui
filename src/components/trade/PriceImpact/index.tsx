import React from 'react'
import BigNumber from 'bignumber.js'

import { FormMessage } from 'components/common/FormMessage'
import { HelpTooltip, HelpTooltipContainer } from 'components/Tooltip'
import { BoldColourTag } from './PriceImpact.styled'
import { PriceSuggestionsWrapper } from '../PriceSuggestions/PriceSuggestions'

import usePriceImpact from './usePriceImpact'

import { PriceImpactProps, SimplePriceImpactProps } from './types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const PriceImpactTooltip: React.FC = () => (
  <HelpTooltipContainer>
    The difference between the market price and the limit price due to order size
  </HelpTooltipContainer>
)

export const SimplePriceImpact: React.FC<SimplePriceImpactProps> = ({ className, impactAmount }) => (
  <BoldColourTag className={className}>
    <HelpTooltip tooltip={<PriceImpactTooltip />} /> {impactAmount}%
  </BoldColourTag>
)

function PriceImpact(params: PriceImpactProps): React.ReactElement | null {
  const {
    baseToken: { id: baseTokenId },
    quoteToken: { id: quoteTokenId, decimals },
    fillPrice,
    ...rest
  } = params

  const { priceImpactSmart, priceImpactWarning, priceImpactClassName } = usePriceImpact({
    ...rest,
    // Match limitPrice and fillPrice precision + force round down last digit
    // Necessary for value comparison when calcilating warnings
    fillPrice: fillPrice?.decimalPlaces(decimals, BigNumber.ROUND_DOWN) || null,
    baseTokenId,
    quoteTokenId,
  })

  return (
    <PriceSuggestionsWrapper as="section">
      {priceImpactSmart && (
        <div className="container">
          <span>
            <span>Price impact </span>
            <SimplePriceImpact className={priceImpactClassName} impactAmount={priceImpactSmart} />
          </span>
        </div>
      )}
      {/* Warning */}
      {priceImpactWarning && (
        <FormMessage className="warning">
          <BoldColourTag as="span">
            <FontAwesomeIcon icon={faExclamationTriangle} size="sm" /> {priceImpactWarning}
          </BoldColourTag>
        </FormMessage>
      )}
    </PriceSuggestionsWrapper>
  )
}

export default PriceImpact
