import type { SkillNode } from '../types/app';

export const WHAT_I_DO_ROWS = [
  ['FULL-STACK WEB', 'MACHINE LEARNING', 'COMPILER DESIGN', 'FULL-STACK WEB', 'MACHINE LEARNING', 'COMPILER DESIGN'],
  ['SYSTEMS ARCHITECTURE', 'DATA ENGINEERING', 'UI/UX DESIGN', 'SYSTEMS ARCHITECTURE', 'DATA ENGINEERING', 'UI/UX DESIGN'],
  ['CLOUD COMPUTING', 'DEVOPS', 'WEBGL & 3D', 'CLOUD COMPUTING', 'DEVOPS', 'WEBGL & 3D'],
  ['LOW-LEVEL SYSTEMS', 'DISTRIBUTED DATABASES', 'PERFORMANCE OPTIMIZATION', 'LOW-LEVEL SYSTEMS', 'DISTRIBUTED DATABASES', 'PERFORMANCE OPTIMIZATION']
] as const;

export const SKILL_TREE: SkillNode[] = [
  {
    name: 'AI & ML', color: '#a855f7', radius: 55, pun: "It's learning...",
    children: [
      { name: 'OpenAI', color: '#c084fc', radius: 35, children: [] },
      { name: 'Llama', color: '#d8b4fe', radius: 35, children: [] },
      { name: 'NLP', color: '#e9d5ff', radius: 35, children: [] },
      { name: 'Vector DBs', color: '#f3e8ff', radius: 35, pun: "What's your angle?", children: [] }
    ]
  },
  {
    name: 'WEB DEV', color: '#3b82f6', radius: 55, pun: 'Caught in the web',
    children: [
      {
        name: 'Frontend', color: '#60a5fa', radius: 35, children: [
          { name: 'React', color: '#93c5fd', radius: 25, children: [] },
          { name: 'UI/UX', color: '#bfdbfe', radius: 25, children: [] }
        ]
      },
      {
        name: 'Backend', color: '#93c5fd', radius: 35, children: [
          { name: 'Node.js', color: '#bfdbfe', radius: 25, children: [] },
          { name: 'Go', color: '#dbeafe', radius: 25, children: [] }
        ]
      }
    ]
  },
  {
    name: 'SYSTEMS', color: '#f97316', radius: 55, pun: 'Down to the metal',
    children: [
      {
        name: 'Rust', color: '#fb923c', radius: 35, pun: 'Safety first!', children: [
          { name: 'Compilers', color: '#fdba74', radius: 25, children: [] }
        ]
      },
      {
        name: 'Databases', color: '#fdba74', radius: 35, children: [
          { name: 'Postgres', color: '#fed7aa', radius: 25, pun: 'Relational AF', children: [] },
          { name: 'Redis', color: '#ffedd5', radius: 25, pun: 'Cache me outside', children: [] }
        ]
      },
      { name: 'Sys Design', color: '#fed7aa', radius: 35, children: [] }
    ]
  }
];

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];
