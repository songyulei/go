// +build go1.15
// remove these tests temporarily until https://github.com/golang/go/issues/38105 and
// https://github.com/golang/go/issues/38940 is fixed

package test

import (
	"bytes"
	"encoding"
	"encoding/json"
	"strings"
	"testing"

	jsoniter "github.com/json-iterator/go"
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

// encoding/json encodes a map key whose underlying kind is string directly
// from its raw string value and never calls MarshalText, even when the key
// type implements encoding.TextMarshaler. jsoniter must match this so that
// ConfigCompatibleWithStandardLibrary stays a drop-in replacement.
func Test_stringKind_map_key_marshalText_ignored(t *testing.T) {
	in := map[stringKeyType]int{"hello": 1}

	std, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("stdlib marshal: %v", err)
	}
	if !bytes.Contains(std, []byte(`"hello":`)) || bytes.Contains(std, []byte("MANUAL__")) {
		t.Fatalf("stdlib should marshal raw string key, got %s", std)
	}

	iter, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(in)
	if err != nil {
		t.Fatalf("jsoniter marshal: %v", err)
	}
	if !bytes.Equal(std, iter) {
		t.Fatalf("string-kind map key mismatch:\nstdlib:  %s\njsoniter: %s", std, iter)
	}
}

// Non-string keys (e.g. structs) that implement encoding.TextMarshaler must
// still be marshaled via MarshalText, in both stdlib and jsoniter.
func Test_struct_map_key_marshalText_used(t *testing.T) {
	in := map[structKeyType]int{{X: "hi"}: 1}

	std, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("stdlib marshal: %v", err)
	}
	if !bytes.Contains(std, []byte("MANUAL__hi")) {
		t.Fatalf("stdlib should marshal struct key via MarshalText, got %s", std)
	}

	iter, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(in)
	if err != nil {
		t.Fatalf("jsoniter marshal: %v", err)
	}
	if !bytes.Equal(std, iter) {
		t.Fatalf("struct map key mismatch:\nstdlib:  %s\njsoniter: %s", std, iter)
	}
}

// Round-tripping through jsoniter must not corrupt the key: after marshal and
// unmarshal the original raw key (and value) must be recoverable.
func Test_stringKind_map_key_roundtrip(t *testing.T) {
	in := map[stringKeyType]string{"alpha": "one", "beta": "two"}

	data, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(in)
	if err != nil {
		t.Fatalf("jsoniter marshal: %v", err)
	}

	var out map[stringKeyType]string
	if err := jsoniter.ConfigCompatibleWithStandardLibrary.Unmarshal(data, &out); err != nil {
		t.Fatalf("jsoniter unmarshal: %v\nvia: %s", err, data)
	}
	if len(out) != len(in) {
		t.Fatalf("expected %d keys, got %d (%v)", len(in), len(out), out)
	}
	for k, v := range in {
		if got, ok := out[k]; !ok || got != v {
			t.Fatalf("missing/corrupted entry key=%q: got %q ok=%v; full map %v", k, got, ok, out)
		}
	}
}
