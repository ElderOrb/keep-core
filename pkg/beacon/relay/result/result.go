package result

import (
	"math/big"
)

// Result of distributed key generation protocol.
//
// Success means that the protocol execution finished with acceptable number of
// disqualified or inactive members. The group of remaining members should be
// added to the signing groups for the threshold relay.
//
// Failure means that the group creation could not finish, due to either the number
// of inactive or disqualified participants, or the presented results being
// disputed in a way where the correct outcome cannot be ascertained.
type Result struct {
	// Result type of the protocol execution. True if success, false if failure.
	Success bool
	// Group public key generated by protocol execution.
	GroupPublicKey *big.Int
	// Disqualified members IDs.
	Disqualified []int
	// Inactive members IDs.
	Inactive []int
}
