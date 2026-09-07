package extra

import (
	"github.com/json-iterator/go"
	"github.com/stretchr/testify/require"
	"testing"
)

func init() {
	jsoniter.RegisterExtension(&BinaryAsStringExtension{})
}

func TestBinaryAsStringCodec(t *testing.T) {
	t.Run("safe set", func(t *testing.T) {
		should := require.New(t)
		output, err := jsoniter.Marshal([]byte("hello"))
		should.NoError(err)
		should.Equal(`"hello"`, string(output))
		var val []byte
		should.NoError(jsoniter.Unmarshal(output, &val))
		should.Equal(`hello`, string(val))
	})
	t.Run("non safe set", func(t *testing.T) {
		should := require.New(t)
		output, err := jsoniter.Marshal([]byte{1, 2, 3, 23})
		should.NoError(err)
		should.Equal(`"\\x01\\x02\\x03\\x17"`, string(output))
		var val []byte
		should.NoError(jsoniter.Unmarshal(output, &val))
		should.Equal([]byte{1, 2, 3, 23}, val)
	})
	t.Run("malformed escape does not panic", func(t *testing.T) {
		should := require.New(t)
		// truncated or invalid binary escapes must report an error instead of
		// panicking with an index-out-of-range.
		for _, input := range []string{
			`"a\\"`,  // trailing backslash escape, content: a \
			`"\\x4"`, // truncated \xNN escape, only one hex digit
			`"\\x"`,  // truncated \x escape
			`"\\"`,   // lone backslash
		} {
			var val []byte
			should.NotPanics(func() {
				err := jsoniter.Unmarshal([]byte(input), &val)
				should.Error(err, "expected error for input %s", input)
			}, "input %s", input)
		}
	})
	t.Run("valid hex escape decodes", func(t *testing.T) {
		should := require.New(t)
		var val []byte
		should.NoError(jsoniter.Unmarshal([]byte(`"\\x41"`), &val))
		should.Equal([]byte{0x41}, val)
	})
	t.Run("mixed bytes round trip preserves data", func(t *testing.T) {
		should := require.New(t)
		// high bytes (>=0x80) must not cause the following/adjacent safe ASCII
		// bytes to be silently dropped.
		original := []byte{0x00, 0x5c, 0x41, 0xff, 'h', 'i'}
		output, err := jsoniter.Marshal(original)
		should.NoError(err)
		var val []byte
		should.NoError(jsoniter.Unmarshal(output, &val))
		should.Equal(original, val)
	})
	t.Run("safe ascii after high byte is kept", func(t *testing.T) {
		should := require.New(t)
		output, err := jsoniter.Marshal([]byte{0xff, 'A', 'B'})
		should.NoError(err)
		should.Contains(string(output), "AB")
		var val []byte
		should.NoError(jsoniter.Unmarshal(output, &val))
		should.Equal([]byte{0xff, 'A', 'B'}, val)
	})
}
