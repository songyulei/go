package jsoniter

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMarshalMapWithNilInterfaceKey(t *testing.T) {
	m := map[interface{}]int{nil: 1}
	shouldNotPanic := func() (err error) {
		defer func() {
			if r := recover(); r != nil {
				t.Fatalf("marshal panicked: %v", r)
			}
		}()
		_, err = Marshal(m)
		return err
	}
	err := shouldNotPanic()
	require.Error(t, err)
}

func TestMarshalMapWithDynamicStringKey(t *testing.T) {
	var key interface{} = "hello"
	m := map[interface{}]int{key: 1}
	out, err := Marshal(m)
	require.NoError(t, err)
	require.Equal(t, `{"hello":1}`, string(out))
}
