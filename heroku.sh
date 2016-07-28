#!/usr/bin/env sh

touch .env
if [ -f  /app/.apt/usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.20 ]; then
    mv /app/.apt/usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.20 /app/.apt/usr/lib/x86_64-linux-gnu/libstdc++.so.6
fi

npm start