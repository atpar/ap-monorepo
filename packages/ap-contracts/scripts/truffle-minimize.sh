#!/bin/bash

# $1 - path to directory containing truffle artifacts
# $2 - path to directory where minimified artifacts should be stored
  
if [ -z "$1" ] 
	then
		echo "No directory for truffle artifacts was specified"
		exit 1;
fi

if [ -z "$2" ]
	then
		echo "No output directory was specified"
		exit 1;
fi

[ -d $2 ] || mkdir $2

for i in "$1"/*.json; do
	m=$2/$(basename "${i%%.json}.min.json")
	# [ -e $m ] && continue
	echo "Minimizing truffle json artifact: $i"
	echo "Original size:  $(wc -c "$i")"
	jq 'del(.ast,.legacyAST,.source,.deployedSourceMap,.userdoc,.deployedBytecode,.sourceMap,.sourcePath,.schemaVersion,.networks,.devdoc)' $i > $m
	echo "Minimized size: $(wc -c "$m")"
done

