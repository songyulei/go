package test

import (
	"encoding/json"
	"testing"

	"github.com/json-iterator/go"
	"github.com/stretchr/testify/require"
)

type textMarshalerStringKey string

func (k textMarshalerStringKey) MarshalText() ([]byte, error) {
	return []byte("MARSHALED_" + k), nil
}

func (k *textMarshalerStringKey) UnmarshalText(text []byte) error {
	*k = textMarshalerStringKey("UNMARSHALED_" + string(text))
	return nil
}

// string-kind map keys must be encoded directly from their underlying string
// value; MarshalText/MarshalJSON must NOT be consulted, matching encoding/json.
// See encoding/json resolveKeyName: "if k.Kind() == reflect.String { return k.String() }".
func Test_encode_map_key_with_text_marshaler_uses_raw_string(t *testing.T) {
	should := require.New(t)
	m := map[textMarshalerStringKey]string{
		"alpha": "1",
		"beta":  "2",
	}

	stdout, err := json.Marshal(m)
	should.NoError(err)
	iterout, err := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(m)
	should.NoError(err)
	should.Equal(string(stdout), string(iterout))

	// the marshaled form must not contain the MarshalText prefix
	should.NotContains(string(iterout), "MARSHALED_")

	// decode side still invokes UnmarshalText for string-kind keys, matching stdlib
	var stdDecoded map[textMarshalerStringKey]string
	should.NoError(json.Unmarshal(stdout, &stdDecoded))
	var iterDecoded map[textMarshalerStringKey]string
	should.NoError(jsoniter.ConfigCompatibleWithStandardLibrary.Unmarshal(stdout, &iterDecoded))
	should.Equal(stdDecoded, iterDecoded)
}
