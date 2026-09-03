package jsoniter

import (
	"encoding"
	"testing"

	"github.com/stretchr/testify/require"
)

type namedStringMapKey string

func (k namedStringMapKey) MarshalText() ([]byte, error) {
	return []byte("TEXT__" + string(k)), nil
}

func (k *namedStringMapKey) UnmarshalText(text []byte) error {
	*k = namedStringMapKey(string(text))
	return nil
}

var _ encoding.TextMarshaler = namedStringMapKey("")
var _ encoding.TextUnmarshaler = new(namedStringMapKey)

// encoding/json marshals string-kind map keys by their raw value and never
// calls MarshalText on them. jsoniter must match to avoid corrupting the key.
func Test_map_key_named_string_does_not_use_marshal_text(t *testing.T) {
	should := require.New(t)

	m := map[namedStringMapKey]string{namedStringMapKey("abc"): "v"}
	out, err := ConfigCompatibleWithStandardLibrary.Marshal(m)
	should.NoError(err)
	should.Equal(`{"abc":"v"}`, string(out))

	var back map[namedStringMapKey]string
	should.NoError(ConfigCompatibleWithStandardLibrary.Unmarshal(out, &back))
	should.Equal("v", back[namedStringMapKey("abc")])
}

type namedStructMapKey struct {
	X string
}

func (k namedStructMapKey) MarshalText() ([]byte, error) {
	return []byte("TEXT__" + k.X), nil
}

func (k *namedStructMapKey) UnmarshalText(text []byte) error {
	k.X = string(text)
	return nil
}

var _ encoding.TextMarshaler = namedStructMapKey{}
var _ encoding.TextUnmarshaler = &namedStructMapKey{}

// Non-string keys that implement TextMarshaler must still use it.
func Test_map_key_struct_uses_marshal_text(t *testing.T) {
	should := require.New(t)

	m := map[namedStructMapKey]string{{X: "abc"}: "v"}
	out, err := ConfigCompatibleWithStandardLibrary.Marshal(m)
	should.NoError(err)
	should.Equal(`{"TEXT__abc":"v"}`, string(out))
}

// \b and \f must be emitted as the short escapes, matching encoding/json,
// rather than \u0008 / \u000c.
func Test_string_escape_backspace_formfeed(t *testing.T) {
	should := require.New(t)

	out, err := ConfigCompatibleWithStandardLibrary.Marshal("\b\f")
	should.NoError(err)
	should.Equal(`"\b\f"`, string(out))

	outNoHTML, err := Config{}.Froze().Marshal("\b\f")
	should.NoError(err)
	should.Equal(`"\b\f"`, string(outNoHTML))
}
