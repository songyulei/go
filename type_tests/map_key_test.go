// +build go1.15
// Since Go 1.15, encoding/json ignores encoding.TextMarshaler for map keys
// whose underlying type is a string (https://github.com/golang/go/issues/38940),
// while encoding.TextUnmarshaler is still honored when decoding
// (https://github.com/golang/go/issues/38105).

package test

import (
	"encoding"
	"strings"
)

func init() {
	testCases = append(testCases,
		(*map[stringKeyType]string)(nil),
		(*map[structKeyType]string)(nil),
	)
}

type stringKeyType string

func (k stringKeyType) MarshalText() ([]byte, error) {
	return []byte("MANUAL__" + k), nil
}

func (k *stringKeyType) UnmarshalText(text []byte) error {
	*k = stringKeyType(strings.TrimPrefix(string(text), "MANUAL__"))
	return nil
}

var _ encoding.TextMarshaler = stringKeyType("")
var _ encoding.TextUnmarshaler = new(stringKeyType)

type structKeyType struct {
	X string
}

func (k structKeyType) MarshalText() ([]byte, error) {
	return []byte("MANUAL__" + k.X), nil
}

func (k *structKeyType) UnmarshalText(text []byte) error {
	k.X = strings.TrimPrefix(string(text), "MANUAL__")
	return nil
}

var _ encoding.TextMarshaler = structKeyType{}
var _ encoding.TextUnmarshaler = &structKeyType{}
