# Crystal Playground

Still WIP, help requested.

The errors rare mainly due to paths changes for requires and types

## Build

Build `llvm_ext`

```sh
LLVM_CONFIG=llvm-config
CRYSTAL_LIB=/usr/share/crystal/src
# On Alpine: /usr/lib/crystal/core

# Privileges are needed (sudo ...) 
cc -c -g -O0 $CRYSTAL_LIB/llvm/ext/llvm_ext.cc -o $CRYSTAL_LIB/llvm/ext/llvm_ext.o $($LLVM_CONFIG --cxxflags)
```

Build `playground`

`crystal build src/playground.cr --release`

## Build with Docker:

To have a statically-linked `playground` binary:

```sh
docker run -it --rm -v $PWD:/app -w /app jrei/crystal-alpine sh -c '\
LLVM_CONFIG=llvm-config
CRYSTAL_LIB=/usr/lib/crystal/core
cc -c -g -O0 $CRYSTAL_LIB/llvm/ext/llvm_ext.cc -o $CRYSTAL_LIB/llvm/ext/llvm_ext.o $($LLVM_CONFIG --cxxflags)

crystal build --static src/playground.cr
chown 1000:1000 playground'
```
