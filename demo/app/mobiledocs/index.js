export default {
  mentionAtom: {
    version: '0.3.0',
    atoms: [
      ['mention-atom', 'Bob', {}],
      ['mention-atom', 'Bob', {}],
      ['mention-atom', 'Bob', {}],
      ['mention-atom', 'Bob', {}],
      ['mention-atom', 'Bob', {}],
      ['mention-atom', 'Bob', {}],
      ['mention-atom', 'Bob', {}],
      ['image-atom', 'n/a', {}]
    ],
    markups: [],
    cards: [],
    sections: [
      [1, 'h2', [
        [0, [], 0, 'Mention Atom']
      ]],
      [1, 'P', [
        [0, [], 0, 'Text before the atom. '],
        [1, [], 0, 0],
        [0, [], 0, ' Text after the atom, before image: '],
        [1, [], 0, 7],
        [0, [], 0, ' text after the image atom']
      ]],
      [1, 'P', [
        [1, [], 0, 1],
        [0, [], 0, ' atom at start']
      ]],
      [1, 'P', [
        [0, [], 0, 'atom at end '],
        [1, [], 0, 2]
      ]],
      [1, 'P', [
        [1, [], 0, 3],
        [1, [], 0, 4],
        [0, [], 0, ' multiple atoms at start and end '],
        [1, [], 0, 5],
        [1, [], 0, 6]
      ]]
    ]
  },
  codemirrorCard: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [
      ['codemirror-card']
    ],
    sections: [
      [1, 'h2', [
        [0, [], 0, 'Codemirror']
      ]],
      [10, 0],
    ]
  },
  'null': null,
  blank: '',
  empty: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [],
    sections: []
  },
  inputCard: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [
      ['input-card']
    ],
    sections: [
      [1, 'H2', [
        [[], 0, 'Input Card']
      ]],
      [10, 0],
      [1, 'P', [
        [0, [], 0, 'Text after the card.']
      ]]
    ]
  },
  imageCard: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [
      ['image-card']
    ],
    sections: [
      [1, 'p', [[0, [], 0, 'before']]],
      [10, 0],
      [1, 'p', [[0, [], 0, 'after']]]
    ]
  },
  selfieCard: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [
      ['selfie-card']
    ],
    sections: [
      [1, 'H2', [
        [0, [], 0, 'Selfie Card']
      ]],
      [10, 0]
    ]
  },
  simpleCard: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [
      ['simple-card']
    ],
    sections: [
      [1, 'p', [[0, [], 0, 'before']]],
      [10, 0],
      [1, 'p', [[0, [], 0, 'after']]]
    ]
  },
  simpleList: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [],
    sections: [
      [1, 'H2', [
        [0, [], 0, 'To do today:']
      ]],
      [3, 'ul', [
        [[0, [], 0, 'buy milk']],
        [[0, [], 0, 'water plants']],
        [[0, [], 0, 'world domination']]
      ]]
    ]
  },
  simple: {
    version: '0.3.0',
    atoms: [],
    markups: [],
    cards: [],
    sections: [
      [1, 'H2', [
        [0, [], 0, 'Hello World']
      ]],
      [1, 'p', [
        [0, [], 0, 'This is Mobiledoc-kit.']
      ]]
    ]
  },
  emberCard: {
    version: '0.2.0',
    sections: [
      [],
      [
        [1, 'p', [[[], 0, 'before']]],
        [10, 'ember-card'],
        [1, 'p', [[[], 0, 'after']]]
      ]
    ]
  },
};
