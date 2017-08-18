const Skiff = require('./')
const memdb = require('memdown')

const delay = (sec, f) => setTimeout(f, sec * (1e3 / 4))

const abortOnError = err => {
  if (err) {
    console.error(err.stack)
    process.abort()
  }
}

delay(3, () => {
  console.log('global timout finished, exiting ...')
  process.exit(0)
})

// ---

const createPeer = addr => {
  const _addrs = new Set(addrs)
  _addrs.delete(addr)
  const skiff = Skiff(addr, {
    db: memdb,
    peers: Array.from(_addrs)
  })
  return skiff
}

const addrs = [
  '/ip4/127.0.0.1/tcp/9490',
  '/ip4/127.0.0.1/tcp/9491',
  '/ip4/127.0.0.1/tcp/9492'
]

const peers = addrs.map(createPeer)

for (let peer of peers) peer.start(abortOnError)

// wait for election to finish
delay(1, () => {
  peers[1].peers((err, x) => {
    abortOnError(err)
    // console.dir(x)
    peers[1].command({ type: 'put', key: 'foo', value: 'bar' }, {}, err => {
      abortOnError(err)
      delay(1, () => {
        peers[2].command({ type: 'get', key: 'foo' }, {}, (err, x) => {
          abortOnError(err)
          console.log(x)
          process.exit()
        })
      })
    })
  })
})
