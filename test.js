const EBT = require('epidemic-broadcast-trees');

var clocks_alice = {};
var clocks_bob = {};

var logs_alice = {};
var logs_bob = {};

function append_alice (msg, cb) {
    console.log(msg);
    var log = logs_alice[msg.author] = logs_alice[msg.author] || [];
    //check that this is the next expected message.
    if(msg.sequence != log.length)
        cb(new Error('out of order, found:'+msg.sequence+', expected:'+log.length))
    else {
        log.push(msg);
        ebt_alice.onAppend(msg)
        cb()
    }
}

function append_bob (msg, cb) {
    var log = logs_bob[msg.author] = logs_bob[msg.author] || []
    //check that this is the next expected message.
    if(msg.sequence != log.length)
        cb(new Error('out of order, found:'+msg.sequence+', expected:'+log.length))
    else {
        log.push(msg)
        ebt_bob.onAppend(msg)
        cb()
    }
}


var ebt_alice = EBT({
    id: 'alice',
    getClock: function (id, cb) {
        //load the peer clock for id.
        cb(null, clocks_alice[id] || {})
    },
    setClock: function (id, clock) {
        //set clock doesn't have take a cb, but it's okay to be async.
        clocks_alice[id] = clock
    },
    getAt: function (pair, cb) {
        //load a message particular message, by id:sequence
        if(!logs_alice[pair.id] || !logs_alice[pair.id][pair.sequence])
            cb(new Error('not found'));
        else
            cb(null, logs_alice[pair.id][pair.sequence])
    },
    append: append_alice,
    isFeed: function (id) {
        return true
    }
});

var ebt_bob = EBT({
    id: 'bob',
    getClock: function (id, cb) {
        //load the peer clock for id.
        cb(null, clocks_bob[id] || {})
    },
    setClock: function (id, clock) {
        //set clock doesn't have take a cb, but it's okay to be async.
        clocks_bob[id] = clock
    },
    getAt: function (pair, cb) {
        //load a message particular message, by id:sequence
        if(!logs_bob[pair.id] || !logs_bob[pair.id][pair.sequence])
            cb(new Error('not found'));
        else
            cb(null, logs_bob[pair.id][pair.sequence])
    },
    append: append_bob,
    isFeed: function (id) {
        return true
    }
});

ebt_alice.state.receive.push({value:{author:'alice', sequence: 0, content: {message: 'hallo'}}});
ebt_alice.state.receive.push({value:{author:'John', sequence: 0, content: {message: 'hallo'}}});
ebt_alice.state.receive.push({value:{author:'alice', sequence: 1, content: {message: 'hallo'}}});
ebt_alice.update();
ebt_alice.onAppend({author:'alice', sequence: 0, content: {message: 'hallo'}});
console.log(logs_alice)


ebt_bob.request('alice', true);
ebt_bob.request('john', true);
ebt_alice.request('bob', true);



var bob_stream = ebt_bob.createStream('alice');
var alice_stream = ebt_alice.createStream('bob');

console.log(JSON.stringify(ebt_bob.state));
console.log(JSON.stringify(ebt_alice.state));

alice_stream.pipe(bob_stream).pipe(alice_stream);


ebt_bob.state.receive.push({value:{author:'alice', sequence: 0, content: {message: 'hallo'}}});
console.log()

console.log(JSON.stringify(ebt_bob.state));
console.log(JSON.stringify(ebt_alice.state));


console.log(logs_bob);


