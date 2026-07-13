package test

import (
	"github.com/json-iterator/go"
	"github.com/stretchr/testify/require"
	"testing"
)

func Test_config_disallowUnknownFields(t *testing.T) {
	should := require.New(t)
	api := jsoniter.Config{DisallowUnknownFields: true}.Froze()

	type TestObject struct {
		Known int `json:"known"`
	}

	var obj TestObject
	should.Nil(api.UnmarshalFromString(`{"known":1}`, &obj))
	should.Equal(1, obj.Known)

	obj = TestObject{}
	should.Error(api.UnmarshalFromString(`{"known":1,"unknown":2}`, &obj))
}
