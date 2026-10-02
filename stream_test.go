package jsoniter

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_writeByte_should_grow_buffer(t *testing.T) {
	should := require.New(t)
	stream := NewStream(ConfigDefault, nil, 1)
	stream.writeByte('1')
	should.Equal("1", string(stream.Buffer()))
	should.Equal(1, len(stream.buf))
	stream.writeByte('2')
	should.Equal("12", string(stream.Buffer()))
	should.Equal(2, len(stream.buf))
	stream.writeThreeBytes('3', '4', '5')
	should.Equal("12345", string(stream.Buffer()))
}

func Test_writeBytes_should_grow_buffer(t *testing.T) {
	should := require.New(t)
	stream := NewStream(ConfigDefault, nil, 1)
	stream.Write([]byte{'1', '2'})
	should.Equal("12", string(stream.Buffer()))
	should.Equal(2, len(stream.buf))
	stream.Write([]byte{'3', '4', '5', '6', '7'})
	should.Equal("1234567", string(stream.Buffer()))
	should.Equal(7, len(stream.buf))
}

func Test_writeIndention_should_grow_buffer(t *testing.T) {
	should := require.New(t)
	stream := NewStream(Config{IndentionStep: 2}.Froze(), nil, 1)
	stream.WriteVal([]int{1, 2, 3})
	should.Equal("[\n  1,\n  2,\n  3\n]", string(stream.Buffer()))
}

func Test_writeRaw_should_grow_buffer(t *testing.T) {
	should := require.New(t)
	stream := NewStream(ConfigDefault, nil, 1)
	stream.WriteRaw("123")
	should.Nil(stream.Error)
	should.Equal("123", string(stream.Buffer()))
}

func Test_writeString_should_grow_buffer(t *testing.T) {
	should := require.New(t)
	stream := NewStream(ConfigDefault, nil, 0)
	stream.WriteString("123")
	should.Nil(stream.Error)
	should.Equal(`"123"`, string(stream.Buffer()))
}

func Test_writeString_should_match_stdlib(t *testing.T) {
	cases := map[string]string{
		"\b":                        `"\b"`,
		"\f":                        `"\f"`,
		"\n\r\t":                    `"\n\r\t"`,
		"\x00":                      `"\u0000"`,
		"\x1f":                      `"\u001f"`,
		"\xff":                      `"\ufffd"`,
		"\u2028":                    `"\u2028"`,
		"\u2029":                    `"\u2029"`,
		"a\bb" + "\xff" + "f\u2028": `"a\bb\ufffdf\u2028"`,
	}
	for input, expected := range cases {
		stream := NewStream(ConfigDefault, nil, 0)
		stream.WriteString(input)
		require.Nil(t, stream.Error)
		require.Equal(t, expected, string(stream.Buffer()), "input: %q", input)
	}
}

func Test_writeStringWithHTMLEscaped_should_match_stdlib(t *testing.T) {
	cases := map[string]string{
		"\b":    `"\b"`,
		"\f":    `"\f"`,
		"<>&":   `"\u003c\u003e\u0026"`,
		"a\bb<": `"a\bb\u003c"`,
	}
	for input, expected := range cases {
		stream := NewStream(ConfigDefault, nil, 0)
		stream.WriteStringWithHTMLEscaped(input)
		require.Nil(t, stream.Error)
		require.Equal(t, expected, string(stream.Buffer()), "input: %q", input)
	}
}

func Test_namedStringMapKey_should_ignore_marshalText(t *testing.T) {
	should := require.New(t)
	output, err := Marshal(map[namedStringMapKey]string{
		namedStringMapKey("abc"): "v1",
	})
	should.NoError(err)
	should.Equal(`{"abc":"v1"}`, string(output))
}

type namedStringMapKey string

func (k namedStringMapKey) MarshalText() ([]byte, error) {
	return []byte("MANUAL__" + k), nil
}

type NopWriter struct {
	bufferSize int
}

func (w *NopWriter) Write(p []byte) (n int, err error) {
	w.bufferSize = cap(p)
	return len(p), nil
}

func Test_flush_buffer_should_stop_grow_buffer(t *testing.T) {
	// Stream an array of a zillion zeros.
	writer := new(NopWriter)
	stream := NewStream(ConfigDefault, writer, 512)
	stream.WriteArrayStart()
	for i := 0; i < 10000000; i++ {
		stream.WriteInt(0)
		stream.WriteMore()
		stream.Flush()
	}
	stream.WriteInt(0)
	stream.WriteArrayEnd()

	// Confirm that the buffer didn't have to grow.
	should := require.New(t)

	// 512 is the internal buffer size set in NewEncoder
	//
	// Flush is called after each array element, so only the first 8 bytes of it
	// is ever used, and it is never extended. Capacity remains 512.
	should.Equal(512, writer.bufferSize)
}
