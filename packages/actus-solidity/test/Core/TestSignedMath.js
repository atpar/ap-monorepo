const BigNumber = require('bignumber.js');
const { shouldFail } = require('openzeppelin-test-helpers');


const TestSignedMath = artifacts.require('TestSignedMath.sol');


contract('SignedMath', () => {
  before(async () => {       
    this.TestSignedMath = await TestSignedMath.new();
  });

  const INT_MAX = new BigNumber(2).pow(256).dividedBy(2).minus(1).toFixed();
  const INT_MIN = new BigNumber(2).pow(256).dividedBy(2).multipliedBy(-1).toFixed();

  it('should test floatMult - no overflow', async () => {
    // multiplicand times Identity should be equal to the multiplicand
    assert.equal(
      (await this.TestSignedMath._floatMult(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(5).shiftedBy(18).toFixed(0, 3)
    );
    // FloatMult INT256_MAX times 1 should be equal to INT256_MAX divided by MULTIPLICATOR
    assert.equal(
      (await this.TestSignedMath._floatMult(INT_MAX, '1')).toString(),
      new BigNumber(INT_MAX).shiftedBy(-18).toFixed(0, 3)
    );
    // FloatMult 10 ** 58 times Identity should be equal to the 10 ** 58
    assert.equal(
      (await this.TestSignedMath._floatMult(new BigNumber(10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(10).pow(58).toFixed(0, 3)
    );
    // FloatMult multiplicand times negative Identity should be equal to the negative multiplicand
    assert.equal(
      (await this.TestSignedMath._floatMult(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(-1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(-5).shiftedBy(18).toFixed(0, 3)
    );
    // FloatMult INT256_MIN times 1 should be equal to INT256_MIN divided by MULTIPLICATOR
    assert.equal(
      (await this.TestSignedMath._floatMult(INT_MIN, '1')).toString(),
      new BigNumber(INT_MIN).shiftedBy(-18).toFixed(0, 2)
    );
    // FloatMult -10 ** 58 times Identity should equal -10 ** 58
    assert.equal(
      (await this.TestSignedMath._floatMult(new BigNumber(-10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(-10).pow(58).toFixed(0, 3)
    );
  });

  it('should test floatMult - overflow', async () => {
    // FloatMult NT256_MAX times 10 should overflow and fail
    // INT256_MAX is mulitplied with 10 before getting divided (normalized) with MULTIPLIER
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatMult(
        INT_MAX,
        '10'
      ),
      'SignedMath.floatMult: OVERFLOW_DETECTED'
    );
    // FloatMult 10 ** 59 times Identity should overflow and fail
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatMult(
        new  BigNumber(10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ),
      'SignedMath.floatMult: OVERFLOW_DETECTED'
    );
    // FloatMult INT256_MIN times 10 should underflow and fail
    // ~ 0.0...01
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatMult(
        INT_MIN,
        '10'
      ),
      'SignedMath.floatMult: OVERFLOW_DETECTED'
    );
    // FloatMult -10 ** 59 times Identity should underflow and fail
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatMult(
        new  BigNumber(-10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ),
      'SignedMath.floatMult: OVERFLOW_DETECTED'
    );
  });

  it('should test floatMult - granularity', async () => {
    // FloatMult Identity times 1 should be equal to 1
    assert.equal(
      (await this.TestSignedMath._floatMult(new BigNumber(1).shiftedBy(18).toFixed(), '1')).toString(),
      '1'
    );
    // FloatMult (Identity - 1) times 1 should fail
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatMult(
        new  BigNumber(1).shiftedBy(18).minus(1).toFixed(),
        '1'
      ),
      'SignedMath.floatMult: CANNOT_REPRESENT_GRANULARITY'
    );
  });

  it('should test floatDiv - no overflow', async () => {
    // FloatDiv dividend divided by Identity should be equal to the dividend
    assert.equal(
      (await this.TestSignedMath._floatDiv(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(5).shiftedBy(18).toFixed(0, 3)
    );
    // FloatDiv 10 ** 58 by Identity should equal 10 ** 58
    assert.equal(
      (await this.TestSignedMath._floatDiv(new BigNumber(10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(10).pow(58).toFixed(0, 3)
    );
    // FloatDiv dividend by negative Identity should be equal to the negative dividend
    assert.equal(
      (await this.TestSignedMath._floatDiv(new BigNumber(5).shiftedBy(18).toFixed(), new BigNumber(-1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(-5).shiftedBy(18).toFixed(0, 3)
    );
    // FloatDiv -10 ** 58 divided by Identity should equal -10 ** 58
    assert.equal(
      (await this.TestSignedMath._floatDiv(new BigNumber(-10).pow(58).toFixed(), new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      new BigNumber(-10).pow(58).toFixed(0, 3)
    );
  });

  it('should test floatDiv - overflow', async () => {
    // FloatDiv INT256_MAX by 1 should overflow and fail
    // ~ 0.0...01
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatDiv(
        INT_MAX,
        '1'
      ),
      'SignedMath.floatDiv: OVERFLOW_DETECTED'
    );
    // FloatDiv 10 ** 59 by Identity should overflow and fail
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatDiv(
        new  BigNumber(10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ),
      'SignedMath.floatDiv: OVERFLOW_DETECTED'
    );
    // FloatDiv INT256_MIN by 1 should underflow and fail
    // ~ 0.0...01
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatDiv(
        INT_MIN,
        '1'
      ),
      'SignedMath.floatDiv: OVERFLOW_DETECTED'
    );
    // FloatDiv -10 ** 59 by Identify should underflow and fail
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatDiv(
        new  BigNumber(-10).pow(59).toFixed(),
        new BigNumber(1).shiftedBy(18).toFixed()
      ),
      'SignedMath.floatDiv: OVERFLOW_DETECTED'
    );
  });

  it('should test floatDiv - granularity', async () => {
    // FloatDiv 1 by Identity should be equal to 1
    assert.equal(
      (await this.TestSignedMath._floatDiv('1', new BigNumber(1).shiftedBy(18).toFixed())).toString(),
      '1'
    );
    // FloatDiv 1 by (Identity + 1) should fail
    // ~ 0.0...01
    await shouldFail.reverting.withMessage(
      this.TestSignedMath._floatDiv(
        '1',
        new  BigNumber(1).shiftedBy(18).plus(1).toFixed()
      ),
      'SignedMath.floatDiv: CANNOT_REPRESENT_GRANULARITY'
    );
  });

  it('should test min', async () => {
    // min of 1 and 2 should be 1
    assert.equal(await this.TestSignedMath._min(1, 2), 1)
    // min of 1 and 0 should be 0
    assert.equal(await this.TestSignedMath._min(1, 0), 0)
    // min of 1 and -1 should be -1
    assert.equal(await this.TestSignedMath._min(1, -1), -1)
  });
  
  it('should test max', async () => {
    // max of 1 and 2 should be 2
    assert.equal(await this.TestSignedMath._max(1, 2), 2)
    // max of 1 and 0 should be 1
    assert.equal(await this.TestSignedMath._max(1, 0), 1)
    // max of 1 and -1 should be 1
    assert.equal(await this.TestSignedMath._max(1, -1), 1)
  });
});
