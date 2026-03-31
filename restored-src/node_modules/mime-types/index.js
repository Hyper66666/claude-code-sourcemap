
const err = (name) => () => {
  throw new Error(
    'mime-types.' + name + '() is stubbed in this build. ' +
    'Do not rely on axios auto-multipart serialization (plain object + Content-Type: multipart/form-data). ' +
    'Use native FormData or hand-roll the multipart body instead. ' +
    'See scripts/build-with-plugins.ts stubMimeTypes plugin.'
  )
}
module.exports = {
  lookup: err('lookup'),
  contentType: err('contentType'),
  extension: err('extension'),
  charset: err('charset'),
  extensions: Object.create(null),
  types: Object.create(null),
  charsets: { lookup: err('charsets.lookup') },
}
