//go:build go1.15
// +build go1.15

// remove these tests temporarily until https://github.com/golang/go/issues/38105 and
// https://github.com/golang/go/issues/38940 is fixed

package test

import (
	"encoding"
	"encoding/json"
	"fmt"
	"github.com/json-iterator/go"
	"strings"
	"testing"
)

func init() {
	testCases = append(testCases,
		(*map[stringKeyType]string)(nil),
		(*map[structKeyType]string)(nil),
	)
}

func Test_map_string_key_with_text_marshaler(t *testing.T) {
	before := map[stringKeyType]string{"a": "v1", "b": "v2"}

	stdBytes, err := json.Marshal(before)
	if err != nil {
		t.Fatalf("stdlib marshal error: %v", err)
	}
	iterBytes, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(before)
	if err != nil {
		t.Fatalf("jsoniter marshal error: %v", err)
	}
	if string(stdBytes) != string(iterBytes) {
		t.Fatalf("string-kind map key must ignore MarshalText, expected %s, got %s",
			stdBytes, iterBytes)
	}

	var after map[stringKeyType]string
	if err := jsoniter.ConfigCompatibleWithStandardLibrary.Unmarshal(stdBytes, &after); err != nil {
		t.Fatalf("jsoniter unmarshal error: %v", err)
	}
	if after["a"] != "v1" || after["b"] != "v2" {
		t.Fatalf("unexpected unmarshal result: %v", after)
	}
}

func Test_map_struct_key_with_text_marshaler(t *testing.T) {
	before := map[structKeyType]string{{X: "k1"}: "v1"}

	stdBytes, err := json.Marshal(before)
	if err != nil {
		t.Fatalf("stdlib marshal error: %v", err)
	}
	iterBytes, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(before)
	if err != nil {
		t.Fatalf("jsoniter marshal error: %v", err)
	}
	if string(stdBytes) != string(iterBytes) {
		t.Fatalf("struct map key must honor MarshalText, expected %s, got %s",
			stdBytes, iterBytes)
	}
}

type numericKeyType int

func (k numericKeyType) MarshalText() ([]byte, error) {
	return []byte(fmt.Sprintf("NUM__%d", k)), nil
}

func Test_map_numeric_key_with_text_marshaler(t *testing.T) {
	before := map[numericKeyType]string{5: "v1"}

	stdBytes, err := json.Marshal(before)
	if err != nil {
		t.Fatalf("stdlib marshal error: %v", err)
	}
	iterBytes, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(before)
	if err != nil {
		t.Fatalf("jsoniter marshal error: %v", err)
	}
	if string(stdBytes) != string(iterBytes) {
		t.Fatalf("non-string map key must honor MarshalText, expected %s, got %s",
			stdBytes, iterBytes)
	}
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
