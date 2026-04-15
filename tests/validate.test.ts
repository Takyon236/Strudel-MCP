import { describe, test, expect } from 'bun:test';
import { validatePattern } from '../src/lib/validate.js';

function errors(code: string) {
  return validatePattern(code).issues.filter((i) => i.severity === 'error');
}
function warnings(code: string) {
  return validatePattern(code).issues.filter((i) => i.severity === 'warning');
}
function infos(code: string) {
  return validatePattern(code).issues.filter((i) => i.severity === 'info');
}

describe('validate — baseline', () => {
  test('empty input is ok', () => {
    const r = validatePattern('');
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });

  test('whitespace only is ok', () => {
    expect(validatePattern('   \n\n  ').ok).toBe(true);
  });

  test('simple valid pattern', () => {
    const r = validatePattern('sound("bd*4")');
    expect(r.ok).toBe(true);
    expect(errors('sound("bd*4")')).toEqual([]);
  });
});

describe('validate — brackets', () => {
  test('balanced parens ok', () => {
    expect(errors('sound("bd").lpf(500)')).toEqual([]);
  });

  test('unclosed paren is error', () => {
    expect(errors('sound("bd"')).not.toEqual([]);
  });

  test('unmatched closing paren is error', () => {
    expect(errors('sound("bd"))')).not.toEqual([]);
  });

  test('nested brackets balance', () => {
    expect(errors('stack(s("bd"), s("hh*[4 2]"))')).toEqual([]);
  });
});

describe('validate — strings and escapes', () => {
  test('backslash escape sequence handled correctly', () => {
    // `"a\\"` = a followed by literal backslash, closed by "
    expect(errors('note("a\\\\")')).toEqual([]);
  });

  test('string containing // is not a comment', () => {
    expect(errors('note("c // not a comment")')).toEqual([]);
  });

  test('unterminated string is error', () => {
    expect(errors('note("unterminated')).not.toEqual([]);
  });

  test('backtick template with mini-notation', () => {
    expect(errors('s(`bd sd\nhh oh`)')).toEqual([]);
  });
});

describe('validate — comments', () => {
  test('line comment content ignored', () => {
    // pulsewarble doesn't exist; should not warn because it's in a comment
    expect(warnings('// try .pulsewarble(4) later\nsound("bd*4")')).toEqual([]);
  });

  test('block comment content ignored', () => {
    expect(warnings('/* sound("xyz").fakecall(1) */\nsound("bd*4")')).toEqual([]);
  });

  test('real typo after comment still caught', () => {
    const w = warnings('// comment\nsound("bd").lpfx(500)');
    expect(w.length).toBe(1);
    expect(w[0].message).toContain('lpfx');
  });
});

describe('validate — identifier scanning', () => {
  test('known function not flagged', () => {
    expect(warnings('sound("bd*4").lpf(1200).room(.5)')).toEqual([]);
  });

  test('unknown method flagged as warning', () => {
    const w = warnings('sound("bd*4").bnk("TR909")');
    expect(w.length).toBe(1);
    expect(w[0].message).toContain('bnk');
  });

  test('PascalCase not flagged (constructor-like)', () => {
    expect(warnings('const x = new SomeClass()')).toEqual([]);
  });

  test('JS keywords not flagged', () => {
    expect(warnings('if (true) { return 1 }')).toEqual([]);
  });
});

describe('validate — mini-notation', () => {
  test('valid mini-notation passes', () => {
    expect(errors('sound("bd sd hh oh")')).toEqual([]);
  });

  test('unbalanced square brackets in mini is error', () => {
    expect(errors('sound("bd [hh hh")')).not.toEqual([]);
  });

  test('unbalanced angle brackets in mini is error', () => {
    expect(errors('sound("<bd hh")')).not.toEqual([]);
  });

  test('nested brackets ok', () => {
    expect(errors('sound("bd [hh [rim rim]] sd")')).toEqual([]);
  });

  test('polyphony with commas', () => {
    expect(errors('sound("bd*4, hh*8, cp")')).toEqual([]);
  });

  test('sample index with colon', () => {
    expect(infos('sound("hh:0 hh:1 hh:2")')).toEqual([]);
  });

  test('chord symbols in mini allowed', () => {
    expect(infos('chord("<Cmaj7 Am7 Fmaj7 G7>")')).toEqual([]);
  });

  test('euclidean rhythm syntax not flagged', () => {
    expect(infos('sound("bd(3,8)")')).toEqual([]);
  });

  test('flat note bb4 allowed', () => {
    expect(infos('note("bb4")')).toEqual([]);
  });

  test('GM instrument name allowed', () => {
    expect(infos('s("gm_synth_bass_1")')).toEqual([]);
  });

  test('drum bank name in bank() allowed', () => {
    expect(infos('s("bd*4").bank("RolandTR909")')).toEqual([]);
  });
});

describe('validate — regression: scale spec false positive', () => {
  test('A:minor inside .scale() is not flagged', () => {
    expect(infos('n("0 2 4").scale("A:minor")')).toEqual([]);
  });

  test('A2:minor inside .scale() is not flagged', () => {
    expect(infos('n("0 2 4").scale("A2:minor")')).toEqual([]);
  });

  test('F#3:lydian inside .scale() is not flagged', () => {
    expect(infos('n("0 2 4").scale("F#3:lydian")')).toEqual([]);
  });

  test('C:minor:pentatonic inside .scale() is not flagged', () => {
    expect(infos('n("0 2 4").scale("C:minor:pentatonic")')).toEqual([]);
  });

  test('all 10 compose styles produce clean output', async () => {
    const { strudelCompose } = await import('../src/tools/compose.js');
    const styles = [
      'house',
      'techno',
      'hip-hop',
      'trap',
      'dnb',
      'jazz',
      'ambient',
      'psytrance',
      'lofi',
      'rock',
    ] as const;
    for (const style of styles) {
      const code = strudelCompose({
        style,
        elements: ['drums', 'bass', 'lead', 'pad'],
      }).content[0].text;
      const r = validatePattern(code);
      expect(r.issues).toEqual([]);
    }
  });
});

describe('validate — regression: template literal interpolation', () => {
  test('${...} inside template literal does not leak tokens', () => {
    expect(infos('const x = `${sound("bd*4")}`')).toEqual([]);
  });

  test('mixed template with interpolation', () => {
    expect(infos('const p = `bd ${q} sd`')).toEqual([]);
  });

  test('nested template literals', () => {
    expect(infos('const a = `${`${b}`}`')).toEqual([]);
  });
});

describe('validate — regression: size effect alias', () => {
  test('.size() does not warn after roomsize alias wired up', () => {
    expect(warnings('sound("bd*4").room(.5).size(3)')).toEqual([]);
  });
});

describe('validate — JS expression edge cases', () => {
  test('arrow function in .every()', () => {
    expect(
      errors('note("c e g").every(4, x => x.rev())'),
    ).toEqual([]);
  });

  test('arrow function with block body', () => {
    expect(
      errors('note("c").sometimes(x => { return x.fast(2); })'),
    ).toEqual([]);
  });

  test('division operator not confused with comment', () => {
    expect(errors('note("c").gain(1/2)')).toEqual([]);
  });

  test('expression a/b next to //comment', () => {
    expect(
      errors('note("c").gain(1/2) // a comment'),
    ).toEqual([]);
  });

  test('object literal in args', () => {
    expect(
      errors('note("c").stuff({foo: 1, bar: 2})'),
    ).toEqual([]);
  });

  test('array literal in args', () => {
    expect(errors('note("c").add([1,2,3])')).toEqual([]);
  });

  test('signal chain sine.range().slow()', () => {
    expect(
      errors('note("c").lpf(sine.range(100, 2000).slow(4))'),
    ).toEqual([]);
  });

  test('number literal with decimal', () => {
    expect(errors('note("c").gain(.5).lpf(1200.5)')).toEqual([]);
  });

  test('negative number', () => {
    expect(errors('note("c").add(-7)')).toEqual([]);
  });

  test('multi-line chain with comments interleaved', () => {
    const code = `note("c e g")
  // first the filter
  .lpf(1200)
  // then room
  .room(.5)
  .gain(.8)`;
    expect(errors(code)).toEqual([]);
    expect(warnings(code)).toEqual([]);
  });

  test('deeply nested brackets', () => {
    expect(
      errors('stack(cat(stack(s("bd"), s("hh")), s("sd")), s("cp"))'),
    ).toEqual([]);
  });

  test('polyphonic chord in mini', () => {
    expect(
      errors('note("[c,e,g] [d,f,a] [g,b,d]")'),
    ).toEqual([]);
  });

  test('nested template literal interpolation', () => {
    expect(
      infos('const x = `outer ${`inner ${y}`}`'),
    ).toEqual([]);
  });
});

describe('validate — very large inputs', () => {
  test('1000 lines of valid patterns', () => {
    const code = 'sound("bd*4").lpf(500)\n'.repeat(1000);
    expect(errors(code)).toEqual([]);
  });

  test('single line with 500 chained methods', () => {
    const chain = Array(500).fill('.gain(.5)').join('');
    const code = `sound("bd*4")${chain}`;
    expect(errors(code)).toEqual([]);
  });
});
