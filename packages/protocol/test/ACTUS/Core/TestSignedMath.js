/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');
const { expectRevert } = require('@openzeppelin/test-helpers');

const { getSnapshotTaker, deployContract } = require('../../helper/setupTestEnvironment');


describe('FixedPointMath', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestFixedPointMath = await deployContract(buidlerRuntime, 'TestFixedPointMath');
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  const INT_MAX = new BigNumber(2).pow(256).dividedBy(2).minus(1).toFixed();
  const INT_MIN = new BigNumber(2).pow(256).dividedBy(2).multipliedBy(-1).toFixed();

  it('should test fixedMul - no overflow', async () => {
    // multiplicand times Identity should be equal to the multiplicand
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(5).shiftedBy(18).toFixed(0, 3)
    );
    // fixedMul INT256_MAX times 1 should be equal to INT256_MAX divided by MULTIPLICATOR
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(INT_MAX, '1').call()).toString(),
      new BigNumber(INT_MAX).shiftedBy(-18).toFixed(0, 3)
    );
    // fixedMul 10 ** 58 times Identity should be equal to the 10 ** 58
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(new BigNumber(10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(10).pow(58).toFixed(0, 3)
    );
    // fixedMul multiplicand times negative Identity should be equal to the negative multiplicand
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(-1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(-5).shiftedBy(18).toFixed(0, 3)
    );
    // fixedMul INT256_MIN times 1 should be equal to INT256_MIN divided by MULTIPLICATOR
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(INT_MIN, '1').call()).toString(),
      new BigNumber(INT_MIN).shiftedBy(-18).toFixed(0, 2)
    );
    // fixedMul -10 ** 58 times Identity should equal -10 ** 58
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(new BigNumber(-10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(-10).pow(58).toFixed(0, 3)
    );
  });

  it('should test fixedMul - overflow', async () => {
    // fixedMul NT256_MAX times 10 should overflow and fail
    // INT256_MAX is mulitplied with 10 before getting divided (normalized) with MULTIPLIER
    await expectRevert(
      this.TestFixedPointMath.methods._fixedMul(
        INT_MAX,
        '10'
      ).call(),
      'FixedPointMath.fixedMul: OVERFLOW_DETECTED'
    );
    // fixedMul 10 ** 59 times Identity should overflow and fail
    await expectRevert(
      this.TestFixedPointMath.methods._fixedMul(
        new  BigNumber(10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ).call(),
      'FixedPointMath.fixedMul: OVERFLOW_DETECTED'
    );
    // fixedMul INT256_MIN times 10 should underflow and fail
    // ~ 0.0...01
    await expectRevert(
      this.TestFixedPointMath.methods._fixedMul(
        INT_MIN,
        '10'
      ).call(),
      'FixedPointMath.fixedMul: OVERFLOW_DETECTED'
    );
    // fixedMul -10 ** 59 times Identity should underflow and fail
    await expectRevert(
      this.TestFixedPointMath.methods._fixedMul(
        new  BigNumber(-10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ).call(),
      'FixedPointMath.fixedMul: OVERFLOW_DETECTED'
    );
  });

  it('should test fixedMul - granularity', async () => {
    // fixedMul Identity times 1 should be equal to 1
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedMul(new BigNumber(1).shiftedBy(18).toFixed(), '1').call()).toString(),
      '1'
    );
    // fixedMul (Identity - 1) times 1 should fail
    await expectRevert(
      this.TestFixedPointMath.methods._fixedMul(
        new  BigNumber(1).shiftedBy(18).minus(1).toFixed(),
        '1'
      ).call(),
      'FixedPointMath.fixedMul: CANNOT_REPRESENT_GRANULARITY'
    );
  });

  it('should test fixedDiv - no overflow', async () => {
    // fixedDiv dividend divided by Identity should be equal to the dividend
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedDiv(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(5).shiftedBy(18).toFixed(0, 3)
    );
    // fixedDiv 10 ** 58 by Identity should equal 10 ** 58
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedDiv(new BigNumber(10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(10).pow(58).toFixed(0, 3)
    );
    // fixedDiv dividend by negative Identity should be equal to the negative dividend
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedDiv(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(-1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(-5).shiftedBy(18).toFixed(0, 3)
    );
    // fixedDiv -10 ** 58 divided by Identity should equal -10 ** 58
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedDiv(new BigNumber(-10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      new BigNumber(-10).pow(58).toFixed(0, 3)
    );
  });

  it('should test fixedDiv - overflow', async () => {
    // fixedDiv INT256_MAX by 1 should overflow and fail
    // ~ 0.0...01
    await expectRevert(
      this.TestFixedPointMath.methods._fixedDiv(
        INT_MAX,
        '1'
      ).call(),
      'FixedPointMath.fixedDiv: OVERFLOW_DETECTED'
    );
    // fixedDiv 10 ** 59 by Identity should overflow and fail
    await expectRevert(
      this.TestFixedPointMath.methods._fixedDiv(
        new  BigNumber(10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ).call(),
      'FixedPointMath.fixedDiv: OVERFLOW_DETECTED'
    );
    // fixedDiv INT256_MIN by 1 should underflow and fail
    // ~ 0.0...01
    await expectRevert(
      this.TestFixedPointMath.methods._fixedDiv(
        INT_MIN,
        '1'
      ).call(),
      'FixedPointMath.fixedDiv: OVERFLOW_DETECTED'
    );
    // fixedDiv -10 ** 59 by Identify should underflow and fail
    await expectRevert(
      this.TestFixedPointMath.methods._fixedDiv(
        new  BigNumber(-10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ).call(),
      'FixedPointMath.fixedDiv: OVERFLOW_DETECTED'
    );
  });

  it('should test fixedDiv - granularity', async () => {
    // fixedDiv 1 by Identity should be equal to 1
    assert.strictEqual(
      (await this.TestFixedPointMath.methods._fixedDiv('1', new BigNumber(1).shiftedBy(18).toFixed()).call()).toString(),
      '1'
    );
    // fixedDiv 1 by (Identity + 1) should fail
    // ~ 0.0...01
    await expectRevert(
      this.TestFixedPointMath.methods._fixedDiv(
        '1',
        new  BigNumber(1).shiftedBy(18).plus(1).toFixed()
      ).call(),
      'FixedPointMath.fixedDiv: CANNOT_REPRESENT_GRANULARITY'
    );
  });

  it('should test min', async () => {
    // min of 1 and 2 should be 1
    assert.strictEqual(await this.TestFixedPointMath.methods._min(1, 2).call(), '1')
    // min of 1 and 0 should be 0
    assert.strictEqual(await this.TestFixedPointMath.methods._min(1, 0).call(), '0')
    // min of 1 and -1 should be -1
    assert.strictEqual(await this.TestFixedPointMath.methods._min(1, -1).call(), '-1')
  });

  it('should test max', async () => {
    // max of 1 and 2 should be 2
    assert.strictEqual(await this.TestFixedPointMath.methods._max(1, 2).call(), '2')
    // max of 1 and 0 should be 1
    assert.strictEqual(await this.TestFixedPointMath.methods._max(1, 0).call(), '1')
    // max of 1 and -1 should be 1
    assert.strictEqual(await this.TestFixedPointMath.methods._max(1, -1).call(), '1')
  });
});
