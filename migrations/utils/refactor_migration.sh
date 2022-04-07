#!/bin/bash
read migration_file
sed -i '' 's/var/let/g; s/function(db)/async db =>/g; s/function(options, seedLink)/(options, seedLink) =>/g; /return/d' $migration_file
echo "Creted migration $migration_file"