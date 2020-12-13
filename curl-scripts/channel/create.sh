#!/bin/bash

API="http://localhost:4741"
URL_PATH="/channelCreator"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "channel": {
      "name": "'"${NAME}"'"
    }
  }'

echo