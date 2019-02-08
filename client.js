const homedir = require('os').homedir();

const pull = require('pull-stream');
const Client = require('ssb-client');
const ssbkeys = require('ssb-keys');
const ref = require('ssb-ref');
const about = require('ssb-about');

const keys = ssbkeys.loadOrCreateSync(homedir + '/.ssb/secret');

// hier reduce function does basically do selection the most current about infomation of the same author.
function reduce (result, item) {
    if (!result) result = {};
    if (item) {
        for (var target in item) {
            var valuesForId = result[target] = result[target] || {}
            for (var key in item[target]) {
                var valuesForKey = valuesForId[key] = valuesForId[key] || {}
                for (var author in item[target][key]) {
                    var value = item[target][key][author]
                    if (!valuesForKey[author] || value[1] > valuesForKey[author][1]) {
                        valuesForKey[author] = value
                    }
                }
            }
        }
    }
    return result
}

// map function does basically a new json object containing only 'about' information.
function map (msg) {
    if (msg.value.content && msg.value.content.type === 'about' && ref.isLink(msg.value.content.about)) {
        var author = msg.value.author;
        var target = msg.value.content.about;
        var values = {};

        for (var key in msg.value.content) {
            if (key !== 'about' && key !== 'type') {
                values[key] = {
                    [author]: [msg.value.content[key], msg.value.timestamp]
                }
            }
        }

        return {
            [target]: values
        }
    }
}

Client({port:8008},function (err, server) {
    if (err) {
        throw err;
    }

    console.log(config)

    pull(server.createHistoryStream({id:keys.id}), pull.collect((error, msgs) => {
        result = {};
        msgs.forEach((msg)=>{
            if(msg.value.content.type === 'about'){
                console.log(JSON.stringify(reduce(result,map(msg))))
            }
        })
    }));

    // server.about.socialValue({key:'name', dest: '@1sw77BWBwCzMlQuPG0YkZw8uiHRpEeBe5uLjzXGY36w=.ed25519'}, (error, sources) => {
    //     sources.forEach((source)=>{
    //         console.log(source)
    //     })
    //
    // });

    // pull(server.createLogStream(), pull.collect((error, sources) => {
    //     sources.forEach((source)=>{
    //         if(source.value.content.type === 'about'){
    //             console.log(source.value.content.name)
    //         }
    //
    //     })
    //
    // }));
    //
    //


    // pull(server.friends.createFriendStream({meta:true}), pull.collect((error, sources) => {
    //   sources.forEach((source)=>{
    //       console.log(source)
    //   })
    //
    // }));
});
