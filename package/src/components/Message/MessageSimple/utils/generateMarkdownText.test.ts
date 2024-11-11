import { generateMarkdownText } from './generateMarkdownText';

describe('generateMarkdownText', () => {
  it.each([
    ['', null],
    ['  test message  ', 'test message'],
    [
      'Hi test@gmail.com @test@gmail.com',
      'Hi [test@gmail.com](mailto:test@gmail.com) @test@gmail.com',
    ],
  ])('Returns the generated markdown text for %p and %p', (text, expected) => {
    const result = generateMarkdownText(text);
    expect(result).toBe(expected);
  });
});
