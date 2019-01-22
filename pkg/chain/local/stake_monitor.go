package local

import (
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/keep-network/keep-core/pkg/chain"
)

var minimumStake = big.NewInt(20000000)

// StakeMonitor implements `chain.StakeMonitor` interface and works
// as a local stub for testing.
type StakeMonitor struct {
	stakers []*localStaker
}

// NewStakeMonitor creates a new instance of `StakeMonitor` test stub.
func NewStakeMonitor() *StakeMonitor {
	return &StakeMonitor{
		stakers: make([]*localStaker, 0),
	}
}

// HasMinimumStake checks if the provided address staked enough to become
// a network operator. The minimum stake is an on-chain parameter.
func (lsm *StakeMonitor) HasMinimumStake(address string) (bool, error) {
	if !common.IsHexAddress(address) {
		return false, fmt.Errorf("not a valid ethereum address: %v", address)
	}

	return lsm.stakers[address], nil
}

// StakerFor returns a staker.Staker instance for the given address. Returns an
// error if the address is invalid.
func (lsm *StakeMonitor) StakerFor(address string) (chain.Staker, error) {
	if !common.IsHexAddress(address) {
		return nil, fmt.Errorf("not a valid ethereum address: %v", address)
	}

	stake := new(big.Int).Mul(
		minimumStake,
		big.NewInt(5),
	)

	return &localStaker{address, stake}, nil
}

// StakeTokens stakes enough tokens for the provided address to be a network
// operator.
func (lsm *StakeMonitor) StakeTokens(address string) error {
	if !common.IsHexAddress(address) {
		return fmt.Errorf("not a valid ethereum address: %v", address)
	}

	lsm.stakers[address] = true
	return nil
}

// UnstakeTokens unstakes all tokens from the provided address so it can no
// longer be a network operator.
func (lsm *StakeMonitor) UnstakeTokens(address string) error {
	if !common.IsHexAddress(address) {
		return fmt.Errorf("not a valid ethereum address: %v", address)
	}

}

func (lsm *StakeMonitor) findStakerByAddress(address string) *localStaker {
	for _, staker := range lsm.stakers {
		if staker.address == address {
			return staker
		}
	}
	return nil
}

type localStaker struct {
	address string
	stake   *big.Int
}

func (ls *localStaker) ID() string {
	return ls.address
}

func (ls *localStaker) Stake() (*big.Int, error) {
	return ls.stake, nil
}

func (ls *localStaker) OnStakeChanged(func(newStake *big.Int)) {
	// Do nothing for now.
}
