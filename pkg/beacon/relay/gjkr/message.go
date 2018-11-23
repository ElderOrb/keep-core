package gjkr

import (
	"fmt"
	"math/big"

	"github.com/keep-network/keep-core/pkg/net/ephemeral"
)

// EphemeralPublicKeyMessage is a message payload that carries sender's
// ephemeral public key generated for the given receiver.
//
// Receiver performs ECDH on sender's ephemeral public key and on receiver's
// private ephemeral key creating a symmetric key used for encrypting
// a conversation between sender and receiver. In case of an accusation for
// malicious behavior, accusing party reveals its private ephemeral key so that
// all the other group members can resolve the accusation looking at messages
// exchanged between accuser and accused party. To validate correctness of
// accuser's private ephemeral key all group members must know its ephemeral
// public key prior to exchanging any messages. That's why ephemeral public key
// of the party is broadcast in the group. Construction of ECDH guarantees that
// no security threat is created this way.
type EphemeralPublicKeyMessage struct {
	senderID   int // i
	receiverID int // j

	ephemeralPublicKey ephemeral.PublicKey // Y_ij
}

// MemberCommitmentsMessage is a message payload that carries the sender's
// commitments to polynomial coefficients during distributed key generation.
//
// It is expected to be broadcast.
type MemberCommitmentsMessage struct {
	senderID int

	commitments []*big.Int // slice of `C_ik`
}

// PeerSharesMessage is a message payload that carries shares `s_ij` and `t_ij`
// calculated by the sender `i` for the recipient `j` during distributed key
// generation.
//
// It is expected to be communicated in an encrypted fashion to the selected
// recipient.
type PeerSharesMessage struct {
	senderID   int // i
	receiverID int // j

	encryptedShareS []byte // s_ij
	encryptedShareT []byte // t_ij
}

func newPeerSharesMessage(
	senderID, receiverID int,
	shareS, shareT *big.Int,
	symmetricKey ephemeral.SymmetricKey,
) (*PeerSharesMessage, error) {
	encryptedS, err := symmetricKey.Encrypt(shareS.Bytes())
	if err != nil {
		return nil, fmt.Errorf("could not create PeerSharesMessage [%v]", err)
	}

	encryptedT, err := symmetricKey.Encrypt(shareT.Bytes())
	if err != nil {
		return nil, fmt.Errorf("could not create PeerSharesMessage [%v]", err)
	}

	return &PeerSharesMessage{senderID, receiverID, encryptedS, encryptedT}, nil
}

func (psm *PeerSharesMessage) shareS(key ephemeral.SymmetricKey) (*big.Int, error) {
	decryptedS, err := key.Decrypt(psm.encryptedShareS)
	if err != nil {
		return nil, fmt.Errorf("could not evaluate S share [%v]", err)
	}

	return new(big.Int).SetBytes(decryptedS), nil
}

func (psm *PeerSharesMessage) shareT(key ephemeral.SymmetricKey) (*big.Int, error) {
	decryptedT, err := key.Decrypt(psm.encryptedShareT)
	if err != nil {
		return nil, fmt.Errorf("could not evaluate T share [%v]", err)
	}

	return new(big.Int).SetBytes(decryptedT), nil
}

func (psm *PeerSharesMessage) IsValid() bool {
	return true // TODO: implement
}

// SecretSharesAccusationsMessage is a message payload that carries all of the
// sender's accusations against other members of the threshold group.
// If all other members behaved honestly from the sender's point of view, this
// message should be broadcast but with an empty slice of `accusedIDs`.
//
// It is expected to be broadcast.
type SecretSharesAccusationsMessage struct {
	senderID int

	accusedIDs []int
}

// MemberPublicKeySharePointsMessage is a message payload that carries the sender's
// public key share points.
// It is expected to be broadcast.
type MemberPublicKeySharePointsMessage struct {
	senderID int

	publicKeySharePoints []*big.Int // A_ik = g^{a_ik} mod p
}

// PointsAccusationsMessage is a message payload that carries all of the sender's
// accusations against other members of the threshold group after public key share
// points validation.
// If all other members behaved honestly from the sender's point of view, this
// message should be broadcast but with an empty slice of `accusedIDs`.
// It is expected to be broadcast.
type PointsAccusationsMessage struct {
	senderID int

	accusedIDs []int
}
