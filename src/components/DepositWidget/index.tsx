import Widget from '../layout/Widget'
import React from 'react'
import styled from 'styled-components'
import Table from './Table'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .contractLink {
    align-self: flex-end;
  }
`
// TODO: add correct source address
const contractSource: string = "https://gnosis.io"

const DepositWidget: React.FC = () => (
  <Widget>
    <Wrapper>
      <a href={contractSource} className='contractLink'>View verified contract</a>
      <Table />
    </Wrapper>
  </Widget>
)

export default DepositWidget
