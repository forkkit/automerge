const assert = require('assert')
const { Encoder, Decoder } = require('../backend/encoding')

function checkEncoded(encoder, bytes) {
  const encoded = encoder.buffer, expected = new Uint8Array(bytes)
  const message = `${encoded} equals ${expected}`
  assert(encoded.byteLength === expected.byteLength, message)
  for (let i = 0; i < encoded.byteLength; i++) {
    assert(encoded[i] === expected[i], message)
  }
}

describe('Binary encoding', () => {
  describe('Encoder and Decoder', () => {
    it('should LEB128-encode unsigned integers', () => {
      checkEncoded(new Encoder().appendUint32(0), [0])
      checkEncoded(new Encoder().appendUint32(1), [1])
      checkEncoded(new Encoder().appendUint32(0x42), [0x42])
      checkEncoded(new Encoder().appendUint32(0x7f), [0x7f])
      checkEncoded(new Encoder().appendUint32(0x80), [0x80, 0x01])
      checkEncoded(new Encoder().appendUint32(0xff), [0xff, 0x01])
      checkEncoded(new Encoder().appendUint32(0x1234), [0xb4, 0x24])
      checkEncoded(new Encoder().appendUint32(0x3fff), [0xff, 0x7f])
      checkEncoded(new Encoder().appendUint32(0x4000), [0x80, 0x80, 0x01])
      checkEncoded(new Encoder().appendUint32(0x5678), [0xf8, 0xac, 0x01])
      checkEncoded(new Encoder().appendUint32(0xfffff), [0xff, 0xff, 0x3f])
      checkEncoded(new Encoder().appendUint32(0x1fffff), [0xff, 0xff, 0x7f])
      checkEncoded(new Encoder().appendUint32(0x200000), [0x80, 0x80, 0x80, 0x01])
      checkEncoded(new Encoder().appendUint32(0xfffffff), [0xff, 0xff, 0xff, 0x7f])
      checkEncoded(new Encoder().appendUint32(0x10000000), [0x80, 0x80, 0x80, 0x80, 0x01])
      checkEncoded(new Encoder().appendUint32(0x7fffffff), [0xff, 0xff, 0xff, 0xff, 0x07])
      checkEncoded(new Encoder().appendUint32(0x87654321), [0xa1, 0x86, 0x95, 0xbb, 0x08])
      checkEncoded(new Encoder().appendUint32(0xffffffff), [0xff, 0xff, 0xff, 0xff, 0x0f])
    })

    it('should encode-decode round-trip unsigned integers', () => {
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0).buffer).readUint32(), 0)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(1).buffer).readUint32(), 1)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x42).buffer).readUint32(), 0x42)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x7f).buffer).readUint32(), 0x7f)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x80).buffer).readUint32(), 0x80)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0xff).buffer).readUint32(), 0xff)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x1234).buffer).readUint32(), 0x1234)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x3fff).buffer).readUint32(), 0x3fff)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x4000).buffer).readUint32(), 0x4000)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x5678).buffer).readUint32(), 0x5678)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0xfffff).buffer).readUint32(), 0xfffff)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x1fffff).buffer).readUint32(), 0x1fffff)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x200000).buffer).readUint32(), 0x200000)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0xfffffff).buffer).readUint32(), 0xfffffff)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x10000000).buffer).readUint32(), 0x10000000)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x7fffffff).buffer).readUint32(), 0x7fffffff)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0x87654321).buffer).readUint32(), 0x87654321)
      assert.strictEqual(new Decoder(new Encoder().appendUint32(0xffffffff).buffer).readUint32(), 0xffffffff)
    })

    it('should LEB128-encode signed integers', () => {
      checkEncoded(new Encoder().appendInt32(0), [0])
      checkEncoded(new Encoder().appendInt32(1), [1])
      checkEncoded(new Encoder().appendInt32(-1), [0x7f])
      checkEncoded(new Encoder().appendInt32(0x3f), [0x3f])
      checkEncoded(new Encoder().appendInt32(0x40), [0xc0, 0x00])
      checkEncoded(new Encoder().appendInt32(-0x3f), [0x41])
      checkEncoded(new Encoder().appendInt32(-0x40), [0x40])
      checkEncoded(new Encoder().appendInt32(-0x41), [0xbf, 0x7f])
      checkEncoded(new Encoder().appendInt32(0x1fff), [0xff, 0x3f])
      checkEncoded(new Encoder().appendInt32(0x2000), [0x80, 0xc0, 0x00])
      checkEncoded(new Encoder().appendInt32(-0x2000), [0x80, 0x40])
      checkEncoded(new Encoder().appendInt32(-0x2001), [0xff, 0xbf, 0x7f])
      checkEncoded(new Encoder().appendInt32(0xfffff), [0xff, 0xff, 0x3f])
      checkEncoded(new Encoder().appendInt32(0x100000), [0x80, 0x80, 0xc0, 0x00])
      checkEncoded(new Encoder().appendInt32(-0x100000), [0x80, 0x80, 0x40])
      checkEncoded(new Encoder().appendInt32(-0x100001), [0xff, 0xff, 0xbf, 0x7f])
      checkEncoded(new Encoder().appendInt32(0x7ffffff), [0xff, 0xff, 0xff, 0x3f])
      checkEncoded(new Encoder().appendInt32(0x8000000), [0x80, 0x80, 0x80, 0xc0, 0x00])
      checkEncoded(new Encoder().appendInt32(-0x8000000), [0x80, 0x80, 0x80, 0x40])
      checkEncoded(new Encoder().appendInt32(-0x8000001), [0xff, 0xff, 0xff, 0xbf, 0x7f])
      checkEncoded(new Encoder().appendInt32(0x76543210), [0x90, 0xe4, 0xd0, 0xb2, 0x07])
      checkEncoded(new Encoder().appendInt32(-0x76543210), [0xf0, 0x9b, 0xaf, 0xcd, 0x78])
      checkEncoded(new Encoder().appendInt32(0x7fffffff), [0xff, 0xff, 0xff, 0xff, 0x07])
      checkEncoded(new Encoder().appendInt32(-0x80000000), [0x80, 0x80, 0x80, 0x80, 0x78])
    })

    it('should encode-decode round-trip signed integers', () => {
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0).buffer).readInt32(), 0)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(1).buffer).readInt32(), 1)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-1).buffer).readInt32(), -1)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x3f).buffer).readInt32(), 0x3f)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x40).buffer).readInt32(), 0x40)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x3f).buffer).readInt32(), -0x3f)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x40).buffer).readInt32(), -0x40)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x41).buffer).readInt32(), -0x41)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x1fff).buffer).readInt32(), 0x1fff)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x2000).buffer).readInt32(), 0x2000)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x2000).buffer).readInt32(), -0x2000)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x2001).buffer).readInt32(), -0x2001)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0xfffff).buffer).readInt32(), 0xfffff)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x100000).buffer).readInt32(), 0x100000)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x100000).buffer).readInt32(), -0x100000)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x100001).buffer).readInt32(), -0x100001)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x7ffffff).buffer).readInt32(), 0x7ffffff)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x8000000).buffer).readInt32(), 0x8000000)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x8000000).buffer).readInt32(), -0x8000000)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x8000001).buffer).readInt32(), -0x8000001)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x76543210).buffer).readInt32(), 0x76543210)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x76543210).buffer).readInt32(), -0x76543210)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(0x7fffffff).buffer).readInt32(), 0x7fffffff)
      assert.strictEqual(new Decoder(new Encoder().appendInt32(-0x80000000).buffer).readInt32(), -0x80000000)
    })

    it('should not encode number values that are out of range', () => {
      assert.throws(() => { new Encoder().appendUint32(0x100000000) }, /out of range/)
      assert.throws(() => { new Encoder().appendUint32(Number.MAX_SAFE_INTEGER) }, /out of range/)
      assert.throws(() => { new Encoder().appendUint32(-1) }, /out of range/)
      assert.throws(() => { new Encoder().appendUint32(-0x80000000) }, /out of range/)
      assert.throws(() => { new Encoder().appendUint32(Number.NEGATIVE_INFINITY) }, /not an integer/)
      assert.throws(() => { new Encoder().appendUint32(Number.NaN) }, /not an integer/)
      assert.throws(() => { new Encoder().appendUint32(Math.PI) }, /not an integer/)
      assert.throws(() => { new Encoder().appendInt32(0x80000000) }, /out of range/)
      assert.throws(() => { new Encoder().appendInt32(Number.MAX_SAFE_INTEGER) }, /out of range/)
      assert.throws(() => { new Encoder().appendInt32(-0x80000001) }, /out of range/)
      assert.throws(() => { new Encoder().appendInt32(Number.NEGATIVE_INFINITY) }, /not an integer/)
      assert.throws(() => { new Encoder().appendInt32(Number.NaN) }, /not an integer/)
      assert.throws(() => { new Encoder().appendInt32(Math.PI) }, /not an integer/)
    })

    it('should not decode number values that are out of range', () => {
      assert.throws(() => { new Decoder(new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x80, 0x00])).readUint32() }, /out of range/)
      assert.throws(() => { new Decoder(new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x80, 0x00])).readInt32() }, /out of range/)
      assert.throws(() => { new Decoder(new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x10])).readUint32() }, /out of range/)
      assert.throws(() => { new Decoder(new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x08])).readInt32() }, /out of range/)
      assert.throws(() => { new Decoder(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0x77])).readInt32() }, /out of range/)
      assert.throws(() => { new Decoder(new Uint8Array([0x80, 0x80])).readUint32() }, /incomplete number/)
      assert.throws(() => { new Decoder(new Uint8Array([0x80, 0x80])).readInt32() }, /incomplete number/)
    })

    it('should encode strings as UTF-8', () => {
      checkEncoded(new Encoder().appendPrefixedString(''), [0])
      checkEncoded(new Encoder().appendPrefixedString('a'), [1, 0x61])
      checkEncoded(new Encoder().appendPrefixedString('Oh là là'), [10, 79, 104, 32, 108, 195, 160, 32, 108, 195, 160])
      checkEncoded(new Encoder().appendPrefixedString('😄'), [4, 0xf0, 0x9f, 0x98, 0x84])
    })

    it('should encode-decode round-trip UTF-8 strings', () => {
      assert.strictEqual(new Decoder(new Encoder().appendPrefixedString('').buffer).readPrefixedString(), '')
      assert.strictEqual(new Decoder(new Encoder().appendPrefixedString('a').buffer).readPrefixedString(), 'a')
      assert.strictEqual(new Decoder(new Encoder().appendPrefixedString('Oh là là').buffer).readPrefixedString(), 'Oh là là')
      assert.strictEqual(new Decoder(new Encoder().appendPrefixedString('😄').buffer).readPrefixedString(), '😄')
    })
  })
})
