import React from 'react'
import TokenGrantForm from './TokenGrantForm'
import WithWeb3Context from './WithWeb3Context'
import FetchTokenGrantsCore from './FetchTokenGrantsCore'
import TokenGrantManagerTable from './TokenGrantManagerTable'
import { Col, Row } from 'react-bootstrap'

class CreateTokenGrantsTab extends React.Component { 

    render() {
        const { data } = this.props
        return (
            <FetchTokenGrantsCore>
                <>
                    <h3>Grant tokens</h3>
                    <p>
                        You can grant tokens with a vesting schedule where balance released to the grantee
                        gradually in a linear fashion until start + duration. By then all of the balance will have vested.
                        You must approve the amount you want to grant by calling approve() method of the token contract first
                    </p>
                    <Row>
                    <Col xs={12} md={8}>
                        <TokenGrantForm />
                    </Col>
                    </Row>
                    <Row>
                    <h3>Granted by you</h3>
                    <Col xs={12}>
                        <TokenGrantManagerTable data={data}/>
                    </Col>
                    </Row>
                </>
            </FetchTokenGrantsCore>
        )
    }
}

export default (props) => (
    <FetchTokenGrantsCore userGrants={false} >
        <CreateTokenGrantsTab />
    </FetchTokenGrantsCore>
)