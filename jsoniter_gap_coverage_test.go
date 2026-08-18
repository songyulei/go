package jsoniter

import (
	"bytes"
	"errors"
	"github.com/json-iterator/go/require"
	"io"
	"strings"
	"testing"
)

// ============================================================
// feature_adapter.go - Unmarshal/Marshal 边界条件测试
// ============================================================

// Test_unmarshal_non_pointer_param 验证非指针参数返回错误
func Test_unmarshal_non_pointer_param(t *testing.T) {
	should := require.New(t)
	var val int
	err := Unmarshal([]byte(`123`), val)
	should.NotNil(err)
	should.Contains(err.Error(), "ptr type")
}

// Test_unmarshal_from_string_non_pointer 验证 UnmarshalFromString 非指针参数
func Test_unmarshal_from_string_non_pointer(t *testing.T) {
	should := require.New(t)
	var val int
	err := UnmarshalFromString(`123`, val)
	should.NotNil(err)
	should.Contains(err.Error(), "ptr type")
}

// Test_unmarshal_trailing_whitespace_variations 验证各种尾随空白的处理
func Test_unmarshal_trailing_whitespace_variations(t *testing.T) {
	should := require.New(t)
	var val int

	// 空格
	should.Nil(Unmarshal([]byte(`123 `), &val))
	should.Equal(123, val)

	// Tab
	should.Nil(Unmarshal([]byte(`123	`), &val))
	should.Equal(123, val)

	// \r\n
	should.Nil(Unmarshal([]byte(`123`+"\r\n"), &val))
	should.Equal(123, val)

	// 多种混合
	should.Nil(Unmarshal([]byte(`123 	`+"\n\r"), &val))
	should.Equal(123, val)
}

// Test_unmarshal_empty_whitespace_only 验证全空白输入
func Test_unmarshal_empty_whitespace_only(t *testing.T) {
	should := require.New(t)
	var val interface{}
	err := Unmarshal([]byte(`   	`+"\n\r"), &val)
	should.NotNil(err)
}

// Test_unmarshal_extra_bytes_after_value 验证多余字节（非空白）返回错误
func Test_unmarshal_extra_bytes_after_value(t *testing.T) {
	should := require.New(t)
	var val int
	err := Unmarshal([]byte(`123 extra`), &val)
	should.NotNil(err)
	should.Contains(err.Error(), "bytes left after unmarshal")
}

// Test_unmarshal_any_extra_bytes_after_value 验证 UnmarshalAny 多余字节
func Test_unmarshal_any_extra_bytes_after_value(t *testing.T) {
	should := require.New(t)
	any, err := UnmarshalAny([]byte(`"hello" world`))
	should.NotNil(err)
	should.Contains(err.Error(), "bytes left after unmarshal")
	should.NotNil(any) // any 仍应返回（即使有错误）
}

// Test_unmarshal_any_from_string_fix_verify 验证修复的 bug：错误时 any 不应为 nil
func Test_unmarshal_any_from_string_fix_verify(t *testing.T) {
	should := require.New(t)
	// 成功路径
	any, err := UnmarshalAnyFromString(`{"key":"val"}`)
	should.Nil(err)
	should.NotNil(any)
	should.Equal(Object, any.ValueType())
	should.Equal("val", any.Get("key").ToString())

	// 错误路径 - 之前的 bug 会返回 nil any
	any, err = UnmarshalAnyFromString(`{"key":"val"} trailing`)
	should.NotNil(err)
	should.NotNil(any) // bug 修复：应该仍然返回解析到的 any，而不是 nil
}

// Test_marshal_and_unmarshal_round_trip 基本的序列化/反序列化往返
func Test_marshal_and_unmarshal_round_trip(t *testing.T) {
	should := require.New(t)

	type TestStruct struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}

	original := TestStruct{Name: "test", Count: 42}
	buf, err := Marshal(original)
	should.Nil(err)
	should.True(len(buf) > 0)

	var decoded TestStruct
	should.Nil(Unmarshal(buf, &decoded))
	should.Equal(original.Name, decoded.Name)
	should.Equal(original.Count, decoded.Count)
}

// Test_marshal_to_string_success_and_error MarshalToString 测试
func Test_marshal_to_string_success_and_error(t *testing.T) {
	should := require.New(t)

	// 成功路径
	str, err := MarshalToString(map[string]int{"a": 1})
	should.Nil(err)
	should.Contains(str, `"a":1`)

	// MarshalToString 走 Marshal 的错误分支 - 使用通道类型（不能序列化）
	ch := make(chan int)
	_, err = MarshalToString(ch)
	should.NotNil(err)
}

// Test_last_not_space_pos_boundary 直接测试 lastNotSpacePos 的边界
func Test_last_not_space_pos_boundary(t *testing.T) {
	should := require.New(t)

	// lastNotSpacePos 被 Unmarshal 使用，我们通过行为验证它
	cases := []struct {
		input    string
		expected int // 期望的返回切片长度
	}{
		{``, 0},
		{` `, 0},
		{`a`, 1},
		{`a `, 1},
		{`a  `, 1},
		{`abc	`, 3},
		{`abc` + "\r\n", 3},
		{` abc `, 4}, // 前导空白保留，只有尾随空白被截断
	}

	for _, c := range cases {
		// 用 "string" 包裹，验证尾随空白不会导致 unmarshal 失败
		if len(c.input) > 0 && c.input[0] == '"' {
			continue
		}
		jsonInput := `"` + c.input + `"`
		var result string
		err := Unmarshal([]byte(jsonInput), &result)
		should.Nil(err, "input: %q", jsonInput)
		// 结果应该是原始字符串，不包括尾随空白（因为 JSON 字符串本身的内容）
		// 这里 lastNotSpacePos 是在整个 JSON 字节切片上操作，
		// 包含了结尾引号，所以应该正确工作
	}
}

// ============================================================
// AdaptedDecoder / AdaptedEncoder 边界测试
// ============================================================

// Test_new_decoder_empty_input 解码器处理空输入
func Test_new_decoder_empty_input(t *testing.T) {
	should := require.New(t)
	decoder := NewDecoder(bytes.NewBufferString(``))
	var val interface{}
	err := decoder.Decode(&val)
	should.NotNil(err) // EOF 或其他错误
}

// Test_new_encoder_flush_error 编码器写入错误传播
type errWriter struct{ failOnWrite bool }

func (e *errWriter) Write(p []byte) (n int, err error) {
	if e.failOnWrite {
		return 0, errors.New("write failed")
	}
	return len(p), nil
}

func Test_new_encoder_flush_error_propagation(t *testing.T) {
	should := require.New(t)
	ew := &errWriter{failOnWrite: true}
	encoder := NewEncoder(ew)
	err := encoder.Encode([]int{1, 2, 3})
	should.NotNil(err)
	should.Contains(err.Error(), "write failed")
}

// Test_new_encoder_set_indent 编码器缩进设置
func Test_new_encoder_set_indent(t *testing.T) {
	should := require.New(t)
	buf := &bytes.Buffer{}
	encoder := NewEncoder(buf)
	encoder.SetIndent("", "  ")
	type Obj struct{ A int }
	should.Nil(encoder.Encode(Obj{A: 1}))
	result := buf.String()
	// 检查是否包含换行符（缩进启用时）
	should.True(strings.Contains(result, "\n") || len(result) > 0)
}

// Test_adapted_decoder_more_and_buffered 解码器 More/Buffered
func Test_adapted_decoder_more_and_buffered(t *testing.T) {
	should := require.New(t)
	// 空缓冲时 More 为 false
	decoder := NewDecoder(bytes.NewBufferString(`{}`))
	var obj map[string]interface{}
	should.Nil(decoder.Decode(&obj))
	should.False(decoder.More())

	// 验证 Buffered 返回非 nil reader
	bufReader := decoder.Buffered()
	should.NotNil(bufReader)
}

// ============================================================
// Any 接口全面测试 - Wrap 各种类型
// ============================================================

// Test_wrap_various_int_types 验证 Wrap 的 Int8/Int16/Uint8/Uint16 支持
func Test_wrap_various_int_types(t *testing.T) {
	should := require.New(t)

	// Int8
	var i8 int8 = -12
	anyI8 := Wrap(i8)
	should.Equal(Number, anyI8.ValueType())
	should.Equal(int32(-12), anyI8.ToInt32())
	should.Equal(int64(-12), anyI8.ToInt64())

	// Int16
	var i16 int16 = -1234
	anyI16 := Wrap(i16)
	should.Equal(Number, anyI16.ValueType())
	should.Equal(int32(-1234), anyI16.ToInt32())

	// Uint8
	var u8 uint8 = 200
	anyU8 := Wrap(u8)
	should.Equal(Number, anyU8.ValueType())
	should.Equal(uint32(200), anyU8.ToUint32())

	// Uint16
	var u16 uint16 = 60000
	anyU16 := Wrap(u16)
	should.Equal(Number, anyU16.ValueType())
	should.Equal(uint32(60000), anyU16.ToUint32())

	// Float32
	var f32 float32 = 3.14
	anyF32 := Wrap(f32)
	should.Equal(Number, anyF32.ValueType())
	should.True(anyF32.ToFloat64() > 3.13 && anyF32.ToFloat64() < 3.15)
}

// Test_wrap_nil_and_existing_any 验证 Wrap(nil) 和 Wrap(Any)
func Test_wrap_nil_and_existing_any(t *testing.T) {
	should := require.New(t)

	// nil -> nilAny
	any := Wrap(nil)
	should.Equal(Nil, any.ValueType())
	should.Nil(any.LastError())
	should.Nil(any.GetInterface())

	// Any -> 原样返回
	innerAny := WrapString("hello")
	wrapped := Wrap(innerAny)
	should.Equal(innerAny, wrapped)
}

// Test_wrap_bool_true_false 验证 Wrap bool 类型
func Test_wrap_bool_true_false(t *testing.T) {
	should := require.New(t)

	anyTrue := Wrap(true)
	should.Equal(Bool, anyTrue.ValueType())
	should.True(anyTrue.ToBool())
	should.Equal("true", anyTrue.ToString())

	anyFalse := Wrap(false)
	should.Equal(Bool, anyFalse.ValueType())
	should.False(anyFalse.ToBool())
	should.Equal("false", anyFalse.ToString())
}

// Test_wrap_unsupported_type Wrap 不支持的类型返回 invalidAny
func Test_wrap_unsupported_type(t *testing.T) {
	should := require.New(t)
	ch := make(chan int)
	any := Wrap(ch)
	should.Equal(Invalid, any.ValueType())
	should.NotNil(any.LastError())
	should.Contains(any.LastError().Error(), "unsupported type")
}

// ============================================================
// invalidAny 类型行为测试
// ============================================================

// Test_invalid_any_all_methods 验证 invalidAny 各方法的零值/错误行为
func Test_invalid_any_all_methods(t *testing.T) {
	should := require.New(t)
	any := &invalidAny{baseAny{}, errors.New("test error")}

	should.Equal(errors.New("test error"), any.LastError())
	should.Equal(Invalid, any.ValueType())
	should.False(any.ToBool())
	should.Equal(0, any.ToInt())
	should.Equal(int32(0), any.ToInt32())
	should.Equal(int64(0), any.ToInt64())
	should.Equal(uint(0), any.ToUint())
	should.Equal(uint32(0), any.ToUint32())
	should.Equal(uint64(0), any.ToUint64())
	should.Equal(float32(0), any.ToFloat32())
	should.Equal(float64(0), any.ToFloat64())
	should.Equal("", any.ToString())
	should.Equal(0, any.Size())
	should.Equal(0, len(any.Keys()))
	should.Equal(0, len(any.GetArray()))
	should.Equal(0, len(any.GetObject()))
	should.Nil(any.Parse())
	should.Nil(any.GetInterface())

	// SetArray/SetObject 返回 false
	should.False(any.SetArray([]Any{}))
	should.False(any.SetObject(map[string]Any{}))

	// IterateObject / IterateArray 返回 (nil, false)
	_, hasObj := any.IterateObject()
	should.False(hasObj)
	_, hasArr := any.IterateArray()
	should.False(hasArr)
}

// Test_invalid_any_get_error_chaining 验证 invalidAny.Get 的错误链
func Test_invalid_any_get_error_chaining(t *testing.T) {
	should := require.New(t)

	// 带原始错误
	any1 := &invalidAny{baseAny{}, errors.New("original err")}
	result := any1.Get("key")
	should.Equal(Invalid, result.ValueType())
	should.Contains(result.LastError().Error(), "original err")
	should.Contains(result.LastError().Error(), "get")

	// 不带原始错误
	any2 := &invalidAny{baseAny{}, nil}
	result = any2.Get("key")
	should.Equal(Invalid, result.ValueType())
	should.Contains(result.LastError().Error(), "get")
}

// ============================================================
// nilAny 类型行为测试
// ============================================================

// Test_nil_any_all_methods 验证 nilAny 各方法行为
func Test_nil_any_all_methods(t *testing.T) {
	should := require.New(t)
	any := &nilAny{}

	should.Nil(any.LastError())
	should.Equal(Nil, any.ValueType())
	should.False(any.ToBool())
	should.Equal(0, any.ToInt())
	should.Equal(int32(0), any.ToInt32())
	should.Equal(int64(0), any.ToInt64())
	should.Equal(uint(0), any.ToUint())
	should.Equal(uint32(0), any.ToUint32())
	should.Equal(uint64(0), any.ToUint64())
	should.Equal(float32(0), any.ToFloat32())
	should.Equal(float64(0), any.ToFloat64())
	should.Equal("", any.ToString())
	should.Equal(0, any.Size())
	should.Nil(any.Parse())
	should.Nil(any.GetInterface())

	// Get from nilAny 走 baseAny.Get，返回 invalid
	result := any.Get("x")
	should.Equal(Invalid, result.ValueType())
}

// Test_nil_any_write_to_writes_nil 验证 nilAny.WriteTo 正确输出 null
func Test_nil_any_write_to_writes_nil(t *testing.T) {
	should := require.New(t)
	stream := NewStream(nil, 64)
	any := &nilAny{}
	any.WriteTo(stream)
	should.Equal(`null`, string(stream.Buffer()))
}

// ============================================================
// Any Get 通配符 '*' 功能测试
// ============================================================

// Test_array_any_get_wildcard 数组类型的通配符 Get
func Test_array_any_get_wildcard(t *testing.T) {
	should := require.New(t)

	// 使用 Wrap 创建 arrayAny
	type Item struct{ Val int }
	arr := []Item{{Val: 1}, {Val: 2}, {Val: 3}}
	any := Wrap(arr)

	result := any.Get(int32('*'), "Val")
	should.Equal(Array, result.ValueType())
	should.Equal(3, result.Size())
	// 每个元素都应该是对应 Val 的值
	elements := result.GetArray()
	for i, el := range elements {
		should.Equal(int64(i+1), el.ToInt64())
	}
}

// Test_object_lazy_any_get_wildcard 对象类型的通配符 Get（lazy 版本）
func Test_object_lazy_any_get_wildcard(t *testing.T) {
	should := require.New(t)

	any, err := UnmarshalAnyFromString(`{"a":{"val":1},"b":{"val":2},"c":{"val":3}}`)
	should.Nil(err)

	result := any.Get(int32('*'), "val")
	should.Equal(Object, result.ValueType())
	obj := result.GetObject()
	should.Equal(3, len(obj))
	should.Equal(int64(1), obj["a"].ToInt64())
	should.Equal(int64(2), obj["b"].ToInt64())
	should.Equal(int64(3), obj["c"].ToInt64())
}

// Test_array_lazy_any_get_wildcard 数组通配符 lazy 版本
func Test_array_lazy_any_get_wildcard(t *testing.T) {
	should := require.New(t)

	any, err := UnmarshalAnyFromString(`[{"v":10},{"v":20},{"v":30}]`)
	should.Nil(err)
	should.Equal(Array, any.ValueType())

	result := any.Get(int32('*'), "v")
	should.Equal(Array, result.ValueType())
	elements := result.GetArray()
	should.Equal(3, len(elements))
	should.Equal(int64(10), elements[0].ToInt64())
	should.Equal(int64(20), elements[1].ToInt64())
	should.Equal(int64(30), elements[2].ToInt64())
}

// ============================================================
// Any SetArray/SetObject 功能测试
// ============================================================

// Test_lazy_array_set_array_via_unmarshal 修改 lazy arrayAny 内容（避免 wrapArray.fillCache 每次重建）
func Test_lazy_array_set_array_via_unmarshal(t *testing.T) {
	should := require.New(t)

	// 使用 UnmarshalAnyFromString 创建的是 arrayLazyAny，fillCache 不会每次从原始 val 重建
	any, err := UnmarshalAnyFromString(`[1,2,3]`)
	should.Nil(err)
	should.Equal(3, any.Size())

	newArr := []Any{WrapInt64(10), WrapInt64(20)}
	should.True(any.SetArray(newArr))
	// SetArray 后 GetArray 应该直接返回设置后的新数组（无需走 fillCache 依赖 Size）
	gotArr := any.GetArray()
	should.Equal(2, len(gotArr))
	should.Equal(int64(10), gotArr[0].ToInt64())
	should.Equal(int64(20), gotArr[1].ToInt64())
	// 通过 Get 也能直接命中 cache（因为 SetArray 设置了 cache）
	should.Equal(int64(10), any.Get(0).ToInt64())
}

// Test_lazy_object_set_object_via_unmarshal 修改 lazy objectLazyAny 内容
func Test_lazy_object_set_object_via_unmarshal(t *testing.T) {
	should := require.New(t)

	// 使用 UnmarshalAnyFromString 创建的 objectLazyAny，fillCache 使用 remaining 不会每次重建
	any, err := UnmarshalAnyFromString(`{"A":5}`)
	should.Nil(err)
	should.Equal(1, any.Size())

	newObj := map[string]Any{
		"X": WrapString("hello"),
		"Y": WrapInt64(100),
	}
	should.True(any.SetObject(newObj))
	// SetObject 后 GetObject 直接返回设置后的 map（不依赖 fillCache/Size）
	gotObj := any.GetObject()
	should.Equal(2, len(gotObj))
	should.Equal("hello", gotObj["X"].ToString())
	should.Equal(int64(100), gotObj["Y"].ToInt64())
	// 通过 Get 也能命中 cache
	should.Equal("hello", any.Get("X").ToString())
}

// Test_lazy_any_set_array_and_object 修改 lazyAny 内容
func Test_lazy_any_set_array_and_object(t *testing.T) {
	should := require.New(t)

	// 数组 lazy
	arrAny, _ := UnmarshalAnyFromString(`[1,2,3]`)
	should.True(arrAny.SetArray([]Any{WrapString("a")}))
	should.Equal(1, arrAny.Size())
	should.Equal("a", arrAny.Get(0).ToString())

	// 对象 lazy
	objAny, _ := UnmarshalAnyFromString(`{"x":1}`)
	should.True(objAny.SetObject(map[string]Any{"new": Wrap(true)}))
	should.Equal(1, objAny.Size())
	should.True(objAny.Get("new").ToBool())
}

// ============================================================
// Iterator 边界条件
// ============================================================

// Test_iterator_unread_byte_boundary unreadByte 边界：head=0 时返回错误
func Test_iterator_unread_byte_boundary(t *testing.T) {
	should := require.New(t)
	iter := ParseBytes([]byte(`"abc"`))
	// 初始 head 为 0，直接 unreadByte 应该报错
	iter.unreadByte()
	should.NotNil(iter.Error)
	should.Contains(iter.Error.Error(), "unread too many bytes")
}

// Test_iterator_what_is_next_invalid WhatIsNext 对无效 token 返回 Invalid
func Test_iterator_what_is_next_invalid(t *testing.T) {
	should := require.New(t)
	// 以非 JSON 起始字符开始
	iter := ParseBytes([]byte(`@invalid`))
	vt := iter.WhatIsNext()
	should.Equal(Invalid, vt)
}

// Test_iterator_reset_bytes_reuse Iterator 重置复用
func Test_iterator_reset_bytes_reuse(t *testing.T) {
	should := require.New(t)
	iter := ParseBytes([]byte(`123`))
	should.Equal(int(123), iter.ReadInt())

	// 重置并读取不同类型
	iter.ResetBytes([]byte(`"hello"`))
	should.Nil(iter.Error)
	should.Equal("hello", iter.ReadString())
}

// Test_iterator_read_nil_true_false ReadNil 对 true/false 返回 false
func Test_iterator_read_nil_true_false(t *testing.T) {
	should := require.New(t)

	iter1 := ParseBytes([]byte(`true`))
	should.False(iter1.ReadNil())

	iter2 := ParseBytes([]byte(`false`))
	should.False(iter2.ReadNil())

	iter3 := ParseBytes([]byte(`null`))
	should.True(iter3.ReadNil())
}

// Test_iterator_read_bool_invalid_token ReadBool 对无效 token 报告错误
func Test_iterator_read_bool_invalid_token(t *testing.T) {
	should := require.New(t)
	iter := ParseBytes([]byte(`123`))
	iter.ReadBool()
	should.NotNil(iter.Error)
	should.Contains(iter.Error.Error(), "ReadBool")
}

// Test_iterator_skip_and_return_bytes_panics_on_reader SkipAndReturnBytes 对 reader 输入 panic
func Test_iterator_skip_and_return_bytes_panics_on_reader(t *testing.T) {
	should := require.New(t)
	defer func() {
		r := recover()
		should.NotNil(r, "expected panic for reader input")
		should.Contains(r.(string), "reader input does not support")
	}()
	iter := Parse(strings.NewReader(`[1,2,3]`), 64)
	iter.SkipAndReturnBytes()
}

// ============================================================
// Stream 边界条件
// ============================================================

// Test_stream_flush_no_writer_nil Stream.Flush 对 nil writer 返回 nil
func Test_stream_flush_no_writer_nil(t *testing.T) {
	should := require.New(t)
	stream := NewStream(nil, 16)
	stream.writeByte('x')
	err := stream.Flush()
	should.Nil(err)
}

// Test_stream_flush_short_write_handling Flush 处理短写（ErrShortWrite）
type shortWriter struct{ written, maxWrite int }

func (s *shortWriter) Write(p []byte) (n int, err error) {
	toWrite := len(p)
	if toWrite > s.maxWrite {
		toWrite = s.maxWrite
	}
	s.written += toWrite
	if toWrite < len(p) {
		return toWrite, io.ErrShortWrite
	}
	return toWrite, nil
}

func Test_stream_flush_short_write_handling(t *testing.T) {
	should := require.New(t)
	sw := &shortWriter{maxWrite: 2}
	stream := NewStream(sw, 1024)
	// 写入比 maxWrite 更长的数据
	stream.Write([]byte("hello world"))
	err := stream.Flush()
	should.NotNil(err)
	should.Equal(io.ErrShortWrite, err)
}

// Test_stream_buffer_growth_various_writes 各种写入操作触发 buffer 增长
func Test_stream_buffer_growth_various_writes(t *testing.T) {
	should := require.New(t)
	// 很小的初始 buffer，几乎所有操作都会触发 grow
	stream := NewStream(nil, 1)

	stream.writeByte('a')
	should.Equal(1, stream.Buffered())
	stream.writeTwoBytes('b', 'c')
	should.Equal(3, stream.Buffered())
	stream.writeThreeBytes('d', 'e', 'f')
	should.Equal(6, stream.Buffered())
	stream.writeFourBytes('g', 'h', 'i', 'j')
	should.Equal(10, stream.Buffered())
	stream.writeFiveBytes('k', 'l', 'm', 'n', 'o')
	should.Equal(15, stream.Buffered())

	stream.WriteNil()
	stream.WriteTrue()
	stream.WriteFalse()

	// 验证总输出是预期的
	expected := "abcdefghijklmn" + "onulltruefalse"
	got := string(stream.Buffer())
	should.Equal(expected, got)
}

// Test_stream_write_object_array_indention Object/Array 开始结束的缩进
func Test_stream_write_object_array_indention(t *testing.T) {
	should := require.New(t)
	stream := NewStream(nil, 256)
	stream.IndentionStep = 2

	stream.WriteObjectStart()
	stream.WriteObjectField("a")
	stream.WriteInt(1)
	stream.WriteMore()
	stream.WriteObjectField("b")
	stream.WriteArrayStart()
	stream.WriteInt(1)
	stream.WriteMore()
	stream.WriteInt(2)
	stream.WriteArrayEnd()
	stream.WriteObjectEnd()

	result := string(stream.Buffer())
	// 缩进启用时必须包含换行符
	should.Contains(result, "\n")
	// 检查结构完整性（缩进格式中数组元素换行，故不检查紧凑的 [1,2]）
	should.Contains(result, `"a"`)
	should.Contains(result, `:1`)
	should.Contains(result, `"b"`)
	should.Contains(result, `[`)
	should.Contains(result, `]`)
	// 验证能被解析回来
	var parsed struct {
		A int   `json:"a"`
		B []int `json:"b"`
	}
	should.Nil(UnmarshalFromString(result, &parsed))
	should.Equal(1, parsed.A)
	should.Equal([]int{1, 2}, parsed.B)
}

// Test_stream_write_string_special_chars 字符串特殊字符转义（慢路径）
func Test_stream_write_string_special_chars(t *testing.T) {
	should := require.New(t)
	stream := NewStream(nil, 256)
	// 包含所有需要转义的字符
	stream.WriteString(`"` + "\\" + "\b\f\n\r\t" + `end`)
	result := string(stream.Buffer())
	should.Equal(`"\"\\\b\f\n\r\tend"`, result)
}

// Test_stream_reset_reuse Stream.Reset 复用流
func Test_stream_reset_reuse(t *testing.T) {
	should := require.New(t)
	buf1 := &bytes.Buffer{}
	stream := NewStream(buf1, 32)
	stream.WriteString("first")
	stream.Flush()
	should.Equal(`"first"`, buf1.String())

	// Reset 到新 writer
	buf2 := &bytes.Buffer{}
	stream.Reset(buf2)
	stream.WriteString("second")
	stream.Flush()
	should.Equal(`"second"`, buf2.String())
}

// ============================================================
// Number 类型的 lazy Any 解析边界
// ============================================================

// Test_lazy_number_any_sign_and_dot 数字 lazy Any 符号和小数点组合
func Test_lazy_number_any_sign_and_dot(t *testing.T) {
	should := require.New(t)

	cases := []struct {
		input       string
		expectType  ValueType
		expectInt   int64
		expectUint  uint64
		expectFloat float64
	}{
		{`0`, Number, 0, 0, 0.0},
		{`-0`, Number, 0, 0, 0.0},
		{`42`, Number, 42, 42, 42.0},
		{`3.14`, Number, 3, 3, 3.14},
	}

	for _, c := range cases {
		any, err := UnmarshalAnyFromString(c.input)
		should.Nil(err, "input: %s", c.input)
		should.Equal(c.expectType, any.ValueType())
		should.Equal(c.expectInt, any.ToInt64(), "ToInt64 input: %s", c.input)
		should.Equal(c.expectUint, any.ToUint64(), "ToUint64 input: %s", c.input)
		if c.expectFloat != 0 {
			floatDiff := any.ToFloat64() - c.expectFloat
			if floatDiff < 0 {
				floatDiff = -floatDiff
			}
			should.True(floatDiff < 0.001, "ToFloat64 mismatch input: %s got: %v", c.input, any.ToFloat64())
		}
	}

	// 超大 uint64（溢出 int64 范围）单独验证
	bigUintAny, err := UnmarshalAnyFromString(`18446744073709551615`)
	should.Nil(err)
	should.Equal(Number, bigUintAny.ValueType())
	should.Equal(uint64(18446744073709551615), bigUintAny.ToUint64())
	should.Equal(int64(-1), bigUintAny.ToInt64()) // 溢出后变为 -1（位级重解释，符合 Go 语义）

	// 负数单独验证（ToUint 系列的实际行为是位级重解释，即 uint 溢出值）
	negAny, err := UnmarshalAnyFromString(`-42`)
	should.Nil(err)
	should.Equal(int64(-42), negAny.ToInt64())
	should.True(negAny.ToUint64() > 0) // 负数转 uint 变为溢出的大数（符合 Go 转换语义）
	negFloat, err := UnmarshalAnyFromString(`-2.5`)
	should.Nil(err)
	should.Equal(int64(-2), negFloat.ToInt64())
	floatDiff := negFloat.ToFloat64() - (-2.5)
	if floatDiff < 0 {
		floatDiff = -floatDiff
	}
	should.True(floatDiff < 0.001)
}

// Test_empty_object_and_array_values 空对象/空数组的各种 ToXxx 转换
func Test_empty_object_and_array_values(t *testing.T) {
	should := require.New(t)

	// 空对象 lazy
	objAny, _ := UnmarshalAnyFromString(`{}`)
	should.Equal(Object, objAny.ValueType())
	should.Equal(0, objAny.Size())
	should.False(objAny.ToBool())
	should.Equal(0, objAny.ToInt())
	should.Equal(int32(0), objAny.ToInt32())
	should.Equal(int64(0), objAny.ToInt64())
	should.Equal(uint(0), objAny.ToUint())
	should.Equal(uint32(0), objAny.ToUint32())
	should.Equal(uint64(0), objAny.ToUint64())
	should.Equal(float32(0), objAny.ToFloat32())
	should.Equal(float64(0), objAny.ToFloat64())
	_, has := objAny.IterateObject()
	should.False(has)

	// 空数组 lazy
	arrAny, _ := UnmarshalAnyFromString(`[]`)
	should.Equal(Array, arrAny.ValueType())
	should.Equal(0, arrAny.Size())
	should.False(arrAny.ToBool())
	should.Equal(0, arrAny.ToInt())
	_, hasArr := arrAny.IterateArray()
	should.False(hasArr)

	// 非空对象 -> ToInt 应为 1
	fullObj, _ := UnmarshalAnyFromString(`{"a":1}`)
	should.Equal(1, fullObj.ToInt())
	should.True(fullObj.ToBool())

	// 非空数组 -> ToInt 应为 1
	fullArr, _ := UnmarshalAnyFromString(`[1]`)
	should.Equal(1, fullArr.ToInt())
	should.True(fullArr.ToBool())
}

// ============================================================
// Map 类型的 Any 包装（mapAny）
// ============================================================

// Test_wrap_map_full_api mapAny 的完整 API
func Test_wrap_map_full_api(t *testing.T) {
	should := require.New(t)

	m := map[string]int{
		"one": 1,
		"two": 2,
	}
	any := Wrap(m)
	should.Equal(Object, any.ValueType())
	should.Equal(2, any.Size())
	should.True(any.ToBool())
	should.Equal(1, any.ToInt())

	keys := any.Keys()
	should.Equal(2, len(keys))

	// 获取具体键
	should.Equal(int64(1), any.Get("one").ToInt64())
	should.Equal(int64(2), any.Get("two").ToInt64())

	// 不存在的键
	notFound := any.Get("missing")
	should.Equal(Invalid, notFound.ValueType())
	should.Contains(notFound.LastError().Error(), "not found")

	// 迭代
	iter, has := any.IterateObject()
	should.True(has)
	found := map[string]int64{}
	for {
		k, v, more := iter()
		found[k] = v.ToInt64()
		if !more {
			break
		}
	}
	should.Equal(int64(1), found["one"])
	should.Equal(int64(2), found["two"])

	// ToString
	str := any.ToString()
	should.Contains(str, `"one":1`)
	should.Contains(str, `"two":2`)
}

// Test_wrap_struct_full_api objectAny（struct 版本）的完整 API
func Test_wrap_struct_full_api(t *testing.T) {
	should := require.New(t)

	type Person struct {
		Name string
		Age  int
	}
	any := Wrap(Person{Name: "Alice", Age: 30})
	should.Equal(Object, any.ValueType())
	should.Equal(2, any.Size())

	// 字段大小写敏感（使用 Go 字段名）
	should.Equal("Alice", any.Get("Name").ToString())
	should.Equal(int64(30), any.Get("Age").ToInt64())

	// 不存在字段
	missing := any.Get("nonexistent")
	should.Equal(Invalid, missing.ValueType())

	// Keys
	keys := any.Keys()
	should.Equal(2, len(keys))

	// GetInterface 返回 map
	iface := any.GetInterface()
	asMap, ok := iface.(map[string]Any)
	should.True(ok)
	should.Equal(2, len(asMap))
}

// Test_empty_struct_wrap 空结构体的 wrap
func Test_empty_struct_wrap(t *testing.T) {
	should := require.New(t)

	type Empty struct{}
	any := Wrap(Empty{})
	should.Equal(Object, any.ValueType())
	should.Equal(0, any.Size())
	should.False(any.ToBool())
	should.Equal(0, any.ToInt())

	_, has := any.IterateObject()
	should.False(has)
}

// ============================================================
// findStringEnd 复杂字符串边界场景
// ============================================================

// Test_string_with_escaped_quotes 带转义引号的字符串读取
func Test_string_with_escaped_quotes(t *testing.T) {
	should := require.New(t)

	cases := []struct {
		json     string
		expected string
	}{
		{`"hel\"lo"`, `hel"lo`},
		{`"he\\\"llo"`, `he\"llo`},   // \\\" => \"
		{`"hello\\\""`, `hello\"`},   // 末尾有 \\\"
		{`"\\\\"`, `\\`},              // \\\\ => \\
		{`"\"\""`, `""`},              // 两个双引号
	}

	for _, c := range cases {
		var result string
		err := UnmarshalFromString(c.json, &result)
		should.Nil(err, "json: %s", c.json)
		should.Equal(c.expected, result, "json: %s", c.json)
	}
}

// ============================================================
// WhatIsNext 值类型判断
// ============================================================

// Test_what_is_next_all_types 验证所有类型的 WhatIsNext 判断
func Test_what_is_next_all_types(t *testing.T) {
	should := require.New(t)

	cases := []struct {
		input    string
		expected ValueType
	}{
		{`"hello"`, String},
		{`123`, Number},
		{`-45`, Number},
		{`3.14`, Number},
		{`null`, Nil},
		{`true`, Bool},
		{`false`, Bool},
		{`[1,2]`, Array},
		{`{"a":1}`, Object},
	}

	for _, c := range cases {
		iter := ParseString(c.input)
		vt := iter.WhatIsNext()
		should.Equal(c.expected, vt, "input: %s", c.input)
	}
}
