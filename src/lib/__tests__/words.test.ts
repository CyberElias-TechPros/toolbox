import { describe, expect, it } from 'vitest';
import { numberToMoney, numberToWords } from '../words';

describe('numberToWords', () => {
  it('zero and one', () => {
    expect(numberToWords(0)).toBe('zero');
    expect(numberToWords(1)).toBe('one');
  });

  it('the classic example from the spec', () => {
    expect(numberToWords(150000)).toBe('one hundred and fifty thousand');
  });

  it('handles hundreds with and without remainder', () => {
    expect(numberToWords(105)).toBe('one hundred and five');
    expect(numberToWords(50)).toBe('fifty');
    expect(numberToWords(1999)).toBe('one thousand, nine hundred and ninety-nine');
  });

  it('scales to million/billion/trillion', () => {
    expect(numberToWords(1000000)).toBe('one million');
    expect(numberToWords(1000000000)).toBe('one billion');
    expect(numberToWords(123456789)).toBe('one hundred and twenty-three million, four hundred and fifty-six thousand, seven hundred and eighty-nine');
  });

  it('negatives', () => {
    expect(numberToWords(-42)).toBe('minus forty-two');
  });

  it('rejects non-integers and out-of-range', () => {
    expect(() => numberToWords(1.5)).toThrow();
    expect(() => numberToWords(10 ** 15)).toThrow();
  });
});

describe('numberToMoney', () => {
  it('uses the currency name and capitalizes the first word', () => {
    expect(numberToMoney(150000, 'NGN')).toBe('One hundred and fifty thousand Nigerian Naira');
  });
  it('pluralizes', () => {
    expect(numberToMoney(2, 'USD')).toBe('Two US Dollars');
    expect(numberToMoney(1, 'GBP')).toBe('One Pound Sterling');
  });
});
