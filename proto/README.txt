Build proto file from project root (parent directory of here): 

```
protoc --experimental_editions --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src/proto -I./proto ./proto/*.proto
```
