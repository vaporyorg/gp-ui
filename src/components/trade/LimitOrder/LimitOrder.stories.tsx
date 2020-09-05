import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { LimitOrder, Props } from './LimitOrder'
import BigNumber from 'bignumber.js'

export default {
  title: 'Trade/LimitOrder',
} as Meta

const GNO = {
  id: 1,
  address: '0x1',
  symbol: 'GNO',
  decimals: 18,
}

const DAI = {
  id: 2,
  address: '0x2',
  symbol: 'DAI',
  decimals: 18,
}

const defaultProps = {
  sellToken: GNO,
  receiveToken: DAI,
  limitPrice: new BigNumber('55.247234'),
  amount: '100',
  isPriceInverted: false,
}

const Template: Story<Partial<Props>> = (props) => {
  return (
    <LimitOrder
      onSwapPrices={(): void => {
        console.log('[LimitOrder.story] Swap Prices')
      }}
      onSelectedPrice={(price): void => console.log('[LimitOrder.story] On selected price', price)}
      onSubmitLimitOrder={(data): void => console.log('[LimitOrder.story] Submit Limit Order', data)}
      {...defaultProps}
      {...props}
    />
  )
}

export const Basic = Template.bind({})
Basic.args = {}

export const NoAmount = Template.bind({})
NoAmount.args = {
  amount: undefined,
}

export const PriceInverted = Template.bind({})
PriceInverted.args = {
  isPriceInverted: true,
}

export const NoTokenSelection = Template.bind({})
NoTokenSelection.args = {
  sellToken: undefined,
  receiveToken: undefined,
}

export const NoSellToken = Template.bind({})
NoSellToken.args = {
  sellToken: undefined,
}

export const NoReceiveToken = Template.bind({})
NoReceiveToken.args = {
  receiveToken: undefined,
}
