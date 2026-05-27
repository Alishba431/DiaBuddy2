export const mockProfile = {
  name: 'Ali',
  age: 9,
  character: 'gluco_lion' as 'gluco_lion' | 'insu_robot' | 'zara_panda',
  language: 'english' as 'english' | 'urdu' | 'roman_urdu',
  points: 340,
  level: 3,
  streak: 5,
};

export const characters = [
  { id: 'gluco_lion', emoji: '🦁', name: 'Gluco', tagline: "I'll keep you brave!" },
  { id: 'insu_robot', emoji: '🤖', name: 'Insu', tagline: "I'll remind you!" },
  { id: 'zara_panda', emoji: '🐼', name: 'Zara', tagline: "I'll guide your food!" },
];

export const mockGlucoseReadings = [
  { id: '1', time: '07:00', value: 95,  type: 'Fasting',      date: 'Today' },
  { id: '2', time: '10:30', value: 210, type: 'After Meal',   date: 'Today' },
  { id: '3', time: '13:00', value: 145, type: 'After Meal',   date: 'Today' },
  { id: '4', time: '16:00', value: 68,  type: 'Before Snack', date: 'Today' },
  { id: '5', time: '19:00', value: 132, type: 'After Meal',   date: 'Today' },
];

export const mockWeeklyData = [
  { day: 'Mon', readings: [95, 210, 145, 132] },
  { day: 'Tue', readings: [88, 195, 130, 68, 142] },
  { day: 'Wed', readings: [102, 185, 165, 120] },
  { day: 'Thu', readings: [76, 220, 148, 115, 135] },
  { day: 'Fri', readings: [91, 178, 155, 90] },
  { day: 'Sat', readings: [110, 200, 162, 78, 140] },
  { day: 'Sun', readings: [95, 210, 145, 68, 132] },
];

// Monthly analytics: 30 days, each with avg glucose
export const mockMonthlyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  avg: Math.round(110 + Math.sin(i * 0.4) * 40 + Math.random() * 25),
  min: Math.round(70 + Math.sin(i * 0.3) * 20),
  max: Math.round(180 + Math.cos(i * 0.5) * 50),
}));

export const mockMissions = [
  { id: '1', icon: 'medical',      title: 'Insulin – Morning dose',   status: 'done'    as 'done' | 'pending', screen: '/treatment/my-medicine', points: 10 },
  { id: '2', icon: 'water',        title: 'Glucose check – Afternoon', status: 'pending' as 'done' | 'pending', screen: '/treatment/my-sugar',     points: 10 },
  { id: '3', icon: 'nutrition',    title: 'Snack reminder',            status: 'pending' as 'done' | 'pending', screen: '/treatment/eat-smart',    points: 5  },
  { id: '4', icon: 'play-circle',  title: 'Learn Zone video',          status: 'pending' as 'done' | 'pending', screen: '/learn',                  points: 25 },
  { id: '5', icon: 'restaurant',   title: 'Log dinner',                status: 'pending' as 'done' | 'pending', screen: '/treatment/eat-smart',    points: 10 },
];

export const earnedBadges = [
  { id: '1', icon: 'document-text', name: 'First Log',    description: 'Logged for the first time!' },
  { id: '2', icon: 'flame',         name: '3-Day Streak', description: 'Logged 3 days in a row!'     },
  { id: '3', icon: 'brain',         name: 'Quiz Master',  description: 'Got 100% on a quiz!'         },
  { id: '4', icon: 'leaf',          name: 'Veggie Hero',  description: 'Ate veggies 5 days!'         },
];

export const lockedBadges = [
  { id: '5', icon: 'lock-closed', name: '7-Day Streak',     description: 'Log for 7 days in a row',         requirement: 'Log for 7 days'         },
  { id: '6', icon: 'lock-closed', name: 'Insulin Hero',     description: 'Never miss a dose for a week',    requirement: 'No missed doses for 7 days' },
  { id: '7', icon: 'lock-closed', name: 'Sugar Detective',  description: 'Log glucose 30 times',            requirement: '30 glucose logs'         },
  { id: '8', icon: 'lock-closed', name: 'Move Champion',    description: 'Exercise 10 times',               requirement: '10 activity logs'        },
];

export const learningVideos = [
  {
    id: '1', title: 'What is Diabetes?', duration: '3:42', topic: 'basics',
    youtubeId: 'X9ivEL5sBmI', youtubeUrl: 'https://www.youtube.com/watch?v=X9ivEL5sBmI',
    emoji: '🩺', color: '#93C5FD', completed: false,
    description: 'Learn what Type 1 Diabetes is and how it affects your body in a fun way!',
    keyPoints: [
      'Type 1 Diabetes happens when the pancreas stops making insulin.',
      'Insulin is like a key that lets sugar into your cells for energy.',
      'You need to check your blood sugar every day to stay healthy.',
    ],
    quiz: [
      { question: 'What does Type 1 Diabetes affect?', options: ['Your heart', 'Your lungs', 'Your pancreas', 'Your bones'], correct: 2, explanation: 'Type 1 Diabetes affects the pancreas — the organ that makes insulin.' },
      { question: 'What does insulin do?', options: ['Makes you sleepy', 'Helps sugar enter cells', 'Makes blood cells', 'Helps you breathe'], correct: 1, explanation: 'Insulin acts like a key, allowing sugar (glucose) to enter your body\'s cells.' },
      { question: 'Where is insulin made in a healthy body?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], correct: 2, explanation: 'The pancreas produces insulin in special cells called beta cells.' },
    ],
  },
  {
    id: '2', title: 'Why Insulin Helps', duration: '4:15', topic: 'insulin',
    youtubeId: 'wvKfzA-aEGs', youtubeUrl: 'https://www.youtube.com/watch?v=wvKfzA-aEGs',
    emoji: '💉', color: '#6EE7B7', completed: true,
    description: 'Discover how insulin works like a key to let sugar into your cells.',
    keyPoints: [
      'Insulin helps glucose move from your blood into your cells.',
      'Without insulin, glucose builds up in your blood.',
      'Children with T1D need insulin shots or a pump every day.',
    ],
    quiz: [
      { question: 'Insulin works like a...?', options: ['Bridge', 'Key', 'Door', 'Window'], correct: 1, explanation: 'Insulin is like a key that unlocks cells to let glucose in.' },
      { question: 'Without insulin, sugar stays in your...?', options: ['Cells', 'Brain', 'Blood', 'Bones'], correct: 2, explanation: 'Without insulin, glucose can\'t enter cells and stays in the bloodstream.' },
      { question: 'Children with T1D need insulin...?', options: ['Once a week', 'Every day', 'Once a month', 'Only when sick'], correct: 1, explanation: 'T1D requires insulin every single day to stay healthy.' },
    ],
  },
  {
    id: '3', title: 'Low Sugar Safety', duration: '2:58', topic: 'safety',
    youtubeId: 'M6X-MmQ5aHw', youtubeUrl: 'https://www.youtube.com/watch?v=M6X-MmQ5aHw',
    emoji: '🚨', color: '#FCA5A5', completed: false,
    description: 'What to do when your blood sugar is too low — fast and safe steps.',
    keyPoints: [
      'Low blood sugar (hypoglycemia) means your sugar dropped below 70 mg/dL.',
      'Signs include shakiness, dizziness, sweating, and feeling confused.',
      'Treat it quickly with juice, glucose tablets, or a small sweet snack.',
    ],
    quiz: [
      { question: 'Low blood sugar is called?', options: ['Hyperglycemia', 'Hypoglycemia', 'Dehydration', 'Fatigue'], correct: 1, explanation: 'Hypoglycemia means low blood sugar — "hypo" means under/below.' },
      { question: 'Which food helps with low sugar?', options: ['Chips', 'Water', 'Juice or glucose tablets', 'Salad'], correct: 2, explanation: 'Fast-acting sugars like juice or glucose tablets raise blood sugar quickly.' },
      { question: 'When should you tell an adult?', options: ['When hungry', 'When your sugar is very low', 'When tired', 'When thirsty'], correct: 1, explanation: 'Always tell an adult when you feel low so they can help you treat it safely.' },
    ],
  },
  {
    id: '4', title: 'Diabetes at School', duration: '5:20', topic: 'school',
    youtubeId: '3r0jT9qVpP8', youtubeUrl: 'https://www.youtube.com/watch?v=3r0jT9qVpP8',
    emoji: '🏫', color: '#FEF08A', completed: false,
    description: 'How to manage diabetes during school hours like a pro.',
    keyPoints: [
      'Tell your teacher and school nurse about your diabetes.',
      'Always keep a fast-acting sugar snack in your bag.',
      'You can check your blood sugar in class if needed — it\'s your right!',
    ],
    quiz: [
      { question: 'Who should know about your diabetes at school?', options: ['Only you', 'Your teacher', 'Your teacher and school nurse', 'Nobody'], correct: 2, explanation: 'Both your teacher and school nurse should know so they can help in an emergency.' },
      { question: 'Can you eat lunch at school with diabetes?', options: ['No', 'Yes, with planning', 'Only sometimes', 'Never'], correct: 1, explanation: 'Yes! With good planning and carb awareness, you can enjoy lunch at school.' },
      { question: 'What should you carry to school?', options: ['Extra homework', 'Fast-acting sugar snack', 'Extra clothes', 'Nothing special'], correct: 1, explanation: 'Always carry a fast-acting sugar snack like glucose tablets or small juice boxes.' },
    ],
  },
  {
    id: '5', title: 'Eating & Playing Safely', duration: '3:50', topic: 'lifestyle',
    youtubeId: 'e4vl6-a8iy4', youtubeUrl: 'https://www.youtube.com/watch?v=e4vl6-a8iy4',
    emoji: '🍎', color: '#A78BFA', completed: false,
    description: 'Enjoy food and exercise while keeping your glucose in the green zone.',
    keyPoints: [
      'Check your glucose before and after exercise.',
      'If glucose is below 120 before sport, eat a small snack first.',
      'Everyday foods like dal, roti, and veggies are great for you!',
    ],
    quiz: [
      { question: 'Before exercise, if sugar is below 120, you should?', options: ['Skip exercise', 'Have a small snack', 'Drink coffee', 'Sleep first'], correct: 1, explanation: 'A small snack raises your glucose to a safe level before physical activity.' },
      { question: 'Which food is an "everyday food"?', options: ['Chocolate', 'Chips', 'Dal and roti', 'Soda'], correct: 2, explanation: 'Dal and roti are wholesome everyday foods great for diabetes management.' },
      { question: 'Exercise helps diabetes because it?', options: ['Raises sugar', 'Lowers sugar naturally', 'Has no effect', 'Makes you tired only'], correct: 1, explanation: 'Exercise helps lower blood sugar naturally and keeps your body healthy.' },
    ],
  },
];

export const quizQuestions: Record<string, Array<{ question: string; options: string[]; correct: number }>> = {
  '1': [
    { question: 'What does Type 1 Diabetes affect?', options: ['Your heart', 'Your lungs', 'Your pancreas', 'Your bones'], correct: 2 },
    { question: 'What does insulin do?', options: ['Makes you sleepy', 'Helps sugar enter cells', 'Makes blood cells', 'Helps you breathe'], correct: 1 },
    { question: 'Where is insulin made in a healthy body?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], correct: 2 },
  ],
  '2': [
    { question: 'Insulin works like a...?', options: ['Bridge', 'Key', 'Door', 'Window'], correct: 1 },
    { question: 'Without insulin, sugar stays in your...?', options: ['Cells', 'Brain', 'Blood', 'Bones'], correct: 2 },
    { question: 'Children with T1D need insulin...?', options: ['Once a week', 'Every day', 'Once a month', 'Only when sick'], correct: 1 },
  ],
  '3': [
    { question: 'Low blood sugar is called?', options: ['Hyperglycemia', 'Hypoglycemia', 'Dehydration', 'Fatigue'], correct: 1 },
    { question: 'Which food helps with low sugar?', options: ['Chips', 'Water', 'Juice or glucose tablets', 'Salad'], correct: 2 },
    { question: 'When should you tell an adult?', options: ['When hungry', 'When your sugar is very low', 'When tired', 'When thirsty'], correct: 1 },
  ],
  '4': [
    { question: 'Who should know about your diabetes at school?', options: ['Only you', 'Your teacher', 'Your teacher and school nurse', 'Nobody'], correct: 2 },
    { question: 'Can you eat lunch at school with diabetes?', options: ['No', 'Yes, with planning', 'Only sometimes', 'Never'], correct: 1 },
    { question: 'What should you carry to school?', options: ['Extra homework', 'Fast-acting sugar snack', 'Extra clothes', 'Nothing special'], correct: 1 },
  ],
  '5': [
    { question: 'Before exercise, if sugar is below 120, you should?', options: ['Skip exercise', 'Have a small snack', 'Drink coffee', 'Sleep first'], correct: 1 },
    { question: 'Which food is an "everyday food"?', options: ['Chocolate', 'Chips', 'Dal and roti', 'Soda'], correct: 2 },
    { question: 'Exercise helps diabetes because it?', options: ['Raises sugar', 'Lowers sugar naturally', 'Has no effect', 'Makes you tired only'], correct: 1 },
  ],
};

export const everydayFoods = [
  { emoji: '🍚', name: 'Rice', carbs: 45 }, { emoji: '🫓', name: 'Roti', carbs: 30 },
  { emoji: '🫘', name: 'Dal', carbs: 20 }, { emoji: '🥦', name: 'Vegetables', carbs: 8 },
  { emoji: '🍎', name: 'Fruits', carbs: 20 }, { emoji: '🥛', name: 'Milk', carbs: 12 },
  { emoji: '🥚', name: 'Eggs', carbs: 1 }, { emoji: '🍗', name: 'Chicken', carbs: 0 },
  { emoji: '🐟', name: 'Fish', carbs: 0 },
];

export const sometimesFoods = [
  { emoji: '🥔', name: 'Chips', carbs: 55 }, { emoji: '🍫', name: 'Chocolate', carbs: 60 },
  { emoji: '🥤', name: 'Soda', carbs: 40 }, { emoji: '🎂', name: 'Cake', carbs: 55 },
  { emoji: '🍦', name: 'Ice Cream', carbs: 35 }, { emoji: '🍪', name: 'Biscuits', carbs: 22 },
];

export const mealHistory = [
  { date: 'Today', meals: [
    { type: 'Breakfast', foods: ['Eggs', 'Roti', 'Milk'], time: '08:00', emoji: '🍳', preGlucose: 95, postGlucose: 145 },
    { type: 'Lunch', foods: ['Rice', 'Dal', 'Chicken'], time: '13:00', emoji: '🍱', preGlucose: 120, postGlucose: 210 },
  ]},
  { date: 'Yesterday', meals: [
    { type: 'Breakfast', foods: ['Roti', 'Vegetables', 'Milk'], time: '07:30', emoji: '🥞', preGlucose: 88, postGlucose: 130 },
    { type: 'Lunch', foods: ['Rice', 'Fish', 'Salad'], time: '12:30', emoji: '🍽️', preGlucose: 105, postGlucose: 185 },
    { type: 'Dinner', foods: ['Roti', 'Dal', 'Eggs'], time: '19:00', emoji: '🌙', preGlucose: 132, postGlucose: 148 },
  ]},
];

export const insulinSchedule = [
  { id: '1', label: 'Morning Dose', time: '08:00', dose: '6 units', status: 'taken' as 'taken' | 'due' | 'missed' },
  { id: '2', label: 'Evening Dose', time: '20:00', dose: '4 units', status: 'due'   as 'taken' | 'due' | 'missed' },
];

export const weeklyInsulinAdherence = [
  { day: 'Mon', taken: 2, total: 2 },
  { day: 'Tue', taken: 2, total: 2 },
  { day: 'Wed', taken: 1, total: 2 },
  { day: 'Thu', taken: 2, total: 2 },
  { day: 'Fri', taken: 2, total: 2 },
  { day: 'Sat', taken: 1, total: 2 },
  { day: 'Sun', taken: 2, total: 2 },
];

export const caregiverSummary = {
  weeklyAdherence: 78,
  avgGlucose: 142,
  hypoEpisodes: 2,
  hyperEpisodes: 3,
  missedInsulinDoses: 2,
  timeInRange: 67,
};

export const activities = [
  { emoji: '🚶', name: 'Walking',    id: 'walking' },
  { emoji: '🤸', name: 'Stretching', id: 'stretching' },
  { emoji: '⚽', name: 'Sports',     id: 'sports' },
  { emoji: '🚴', name: 'Cycling',    id: 'cycling' },
  { emoji: '💃', name: 'Dancing',    id: 'dancing' },
];

export const miniChallenges = [
  { id: '1', emoji: '🤸', title: '10 jumping jacks',    points: 15 },
  { id: '2', emoji: '🚶', title: 'Walk for 10 minutes', points: 20 },
  { id: '3', emoji: '💪', title: 'Stretch for 5 minutes', points: 10 },
];

export const pointsHistory = [
  { date: 'Today',     action: 'Logged glucose',   points: 10 },
  { date: 'Today',     action: 'Completed quiz',    points: 25 },
  { date: 'Yesterday', action: 'Morning insulin',   points: 10 },
  { date: 'Yesterday', action: 'Eat smart log',     points: 10 },
  { date: '2 days ago', action: '3-Day Streak bonus', points: 50 },
];

export const weeklyData = [
  { avg: 142, min: 95,  max: 210 },
  { avg: 125, min: 68,  max: 195 },
  { avg: 143, min: 102, max: 185 },
  { avg: 139, min: 76,  max: 220 },
  { avg: 129, min: 90,  max: 178 },
  { avg: 138, min: 78,  max: 200 },
  { avg: 130, min: 68,  max: 210 },
];
