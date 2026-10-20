//go:build go1.15
// +build go1.15

// remove these tests temporarily until https://github.com/golang/go/issues/38105 and
// https://github.com/golang/go/issues/38940 is fixed

package test

import (
	"encoding"
	"encoding/json"
	"strings"
	"testing"

	"github.com/json-iterator/go"
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

func Test_string_map_key_ignores_marshal_text(t *testing.T) {
	m := map[stringKeyType]string{"abc": "v"}

	std, err := json.Marshal(m)
	if err != nil {
		t.Fatalf("stdlib marshal: %v", err)
	}
	iter, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(m)
	if err != nil {
		t.Fatalf("jsoniter marshal: %v", err)
	}
	if string(std) != string(iter) {
		t.Fatalf("string-kind map key must ignore MarshalText:\nstdlib:   %s\njsoniter: %s", std, iter)
	}
	if strings.Contains(string(iter), "MANUAL__") {
		t.Fatalf("map key was rewritten by MarshalText: %s", iter)
	}

	sm := map[structKeyType]string{{X: "k"}: "v"}
	stdStruct, err := json.Marshal(sm)
	if err != nil {
		t.Fatalf("stdlib struct-key marshal: %v", err)
	}
	iterStruct, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(sm)
	if err != nil {
		t.Fatalf("jsoniter struct-key marshal: %v", err)
	}
	if string(stdStruct) != string(iterStruct) {
		t.Fatalf("struct map key must honor MarshalText:\nstdlib:   %s\njsoniter: %s", stdStruct, iterStruct)
	}
	if !strings.Contains(string(iterStruct), "MANUAL__") {
		t.Fatalf("struct key was not encoded via MarshalText: %s", iterStruct)
	}
}
