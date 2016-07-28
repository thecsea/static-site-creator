/**
 * Created by claudio on 28/07/16.
 */

var fs = require('fs');

fs.writeFileSync('.env','');
try {
    // Query the entry
    stats = fs.lstatSync('/app/.apt/usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.20');
    fs.renameSync("/app/.apt/usr/lib/x86_64-linux-gnu/libstdc++.so.6.0.20", "/app/.apt/usr/lib/x86_64-linux-gnu/libstdc++.so.6");
}catch(e){}