package main

import (
	"encoding/json"
	"fmt"

	jsoniter "github.com/json-iterator/go"
)

type stringKey string

func (k stringKey) MarshalText() ([]byte, error) {
	return []byte("MANUAL__" + k), nil
}

func main() {
	m := map[stringKey]string{"abc": "v"}
	std, _ := json.Marshal(m)
	iter, _ := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(m)
	fmt.Println("stdlib map-key TextMarshaler:", string(std))
	fmt.Println("jsoniter map-key TextMarshaler:", string(iter))

	var b []byte
	j, _ := jsoniter.Marshal(&b)
	fmt.Println("marshal nil []byte:", string(j))

	var b2 []byte
	err := jsoniter.Unmarshal([]byte("null"), &b2)
	fmt.Println("unmarshal null into []byte: err=", err, "b2==nil:", b2 == nil)

	var b3 []byte
	err = jsoniter.Unmarshal([]byte("\"aGVsbG8=\""), &b3)
	fmt.Println("unmarshal base64 string: err=", err, "val=", string(b3))

	var b4 []byte
	err = jsoniter.Unmarshal([]byte("[1,2,3]"), &b4)
	fmt.Println("unmarshal array into []byte: err=", err, "val=", b4)

	// control char round trip sanity
	for _, s := range []string{"\b", "\f", "\t", "\n", "\r", "\"", "\\", "a<&>b"} {
		out, _ := jsoniter.ConfigCompatibleWithStandardLibrary.Marshal(s)
		var back string
		e := json.Unmarshal(out, &back)
		fmt.Printf("ctrl %q -> %s -> unmarshal err=%v match=%v\n", s, out, e, back == s)
	}
}
