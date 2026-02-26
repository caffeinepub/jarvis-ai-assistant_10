export interface MentorMessage {
  text: string;
  category: 'motivation' | 'tip' | 'reminder' | 'greeting' | 'challenge';
}

export interface MentorData {
  name: string;
  title: string;
  color: string;
  messages: MentorMessage[];
  greetings: string[];
  challenges: string[];
}

const RENGOKU_MESSAGES: MentorMessage[] = [
  { text: "SET YOUR HEART ABLAZE! No matter how many times you are knocked down, you rise again with even greater flames!", category: 'motivation' },
  { text: "UMAI! UMAI! UMAI! Delicious! That is how you must approach every task — with full enthusiasm and no hesitation!", category: 'motivation' },
  { text: "A person who has a weak heart cannot become a Hashira. Strengthen your resolve and push beyond your limits!", category: 'challenge' },
  { text: "It is not a disgrace to be unable to do something. The disgrace is in giving up without trying!", category: 'motivation' },
  { text: "My flame burns brighter than anyone! And yours can too — if you refuse to let it die!", category: 'motivation' },
  { text: "The weak have no rights or choices. Their only option is to be protected. Do you want to be weak? Then train harder!", category: 'challenge' },
  { text: "I will not waver! I will not retreat! A Flame Hashira advances, always forward, never back!", category: 'motivation' },
  { text: "Even if my body is cut to pieces, I will protect everyone here! That is the duty of a Hashira!", category: 'motivation' },
  { text: "Grow old with me, and together we will overcome every obstacle! Your potential is limitless!", category: 'tip' },
  { text: "The bond between a mentor and student is sacred. I will pour everything I have into making you stronger!", category: 'reminder' },
  { text: "Do not let the fire in your heart go out! Every morning you wake up is another chance to become stronger!", category: 'reminder' },
  { text: "HASHIRA! That is what you must aim to become — the absolute best at what you do!", category: 'challenge' },
];

const RENGOKU_GREETINGS = [
  "UMAI! You have returned! Let us make today burn brighter than yesterday!",
  "Ah, you are here! Excellent! The flames of your potential grow stronger each day!",
  "Welcome back, warrior! Today we push beyond yesterday's limits — SET YOUR HEART ABLAZE!",
  "I have been waiting! A true Hashira never wastes a single moment. Let us begin!",
];

const RENGOKU_CHALLENGES = [
  "Today's challenge: Complete every task with the intensity of a Flame Breathing technique!",
  "A Hashira's challenge: Do not rest until you have given 100% to every single goal today!",
  "The flame challenge: For every obstacle you face today, find TWO solutions!",
  "Rengoku's trial: Approach one difficult task you have been avoiding. Face it head-on!",
];

const NARUTO_MESSAGES: MentorMessage[] = [
  { text: "Believe it! No matter what anyone says about you, you have the power to change your destiny!", category: 'motivation' },
  { text: "I never go back on my word — that is my ninja way! Make your own ninja way and never abandon it!", category: 'motivation' },
  { text: "The pain of being alone is completely out of this world, isn't it? But you are not alone — I am here!", category: 'reminder' },
  { text: "Hard work is worthless for those that don't believe in themselves. Believe in yourself first!", category: 'tip' },
  { text: "I'm not gonna run away, I never go back on my word! That's my nindo, my ninja way!", category: 'motivation' },
  { text: "When people are protecting something truly special to them, they truly can become... as strong as they need to be!", category: 'challenge' },
  { text: "Dattebayo! Every Hokage started as a nobody. Your journey to greatness starts right now!", category: 'motivation' },
  { text: "The moment people come to know love, they run the risk of carrying hate. Choose love every time!", category: 'tip' },
  { text: "A dropout will surpass a genius through hard work! Keep grinding, believe it!", category: 'challenge' },
  { text: "I want to be Hokage! And I will be! Set your biggest dream and chase it with everything you have!", category: 'motivation' },
  { text: "Failing doesn't give you a reason to give up, as long as you believe in yourself!", category: 'reminder' },
  { text: "The next generation will always surpass the previous one. It's one of the never-ending cycles in life!", category: 'tip' },
];

const NARUTO_GREETINGS = [
  "Hey! Believe it! You showed up today — that already makes you a shinobi worth respecting!",
  "Dattebayo! I knew you would come back stronger! Let's make today count!",
  "Yo! The future Hokage is here! Let's get to work — believe it!",
  "Hey hey hey! No slacking! A true ninja is always ready. Let's go!",
];

const NARUTO_CHALLENGES = [
  "Today's mission: Complete your three hardest tasks first. A Hokage tackles the toughest challenges head-on!",
  "Shadow Clone challenge: Divide your big goal into smaller tasks and conquer them one by one!",
  "Ninja way challenge: Identify one thing you have been avoiding and face it today — believe it!",
  "Rasengan focus: Pick ONE important goal and give it your absolute maximum effort today!",
];

const TONY_STARK_MESSAGES: MentorMessage[] = [
  { text: "Genius, billionaire, playboy, philanthropist — pick your path and own it completely. No half measures.", category: 'motivation' },
  { text: "I am Iron Man. Three words that changed everything. What three words define YOU?", category: 'challenge' },
  { text: "Part of the journey is the end. But today is not that end — today you build something extraordinary.", category: 'motivation' },
  { text: "I have a plan: attack. Stop overthinking and start executing. Perfection is the enemy of done.", category: 'tip' },
  { text: "Sometimes you gotta run before you can walk. Ship it, iterate, improve. That is how innovation works.", category: 'tip' },
  { text: "The truth is... I am Iron Man. Own your identity. Stop hiding your capabilities from the world.", category: 'motivation' },
  { text: "JARVIS, run the numbers. Data beats intuition every time. Make decisions based on evidence, not fear.", category: 'tip' },
  { text: "I build a suit of armor around the world. What are you building today that will protect what matters?", category: 'challenge' },
  { text: "Proof that Tony Stark has a heart. Prove to yourself today that you have the heart to finish what you started.", category: 'reminder' },
  { text: "I am not the hero type. Clearly. With this laundry list of character defects, all the mistakes I've made... but I am trying.", category: 'reminder' },
  { text: "Friday, what is our status? Always know your metrics. Track your progress or you are flying blind.", category: 'tip' },
  { text: "We create our own demons. Identify what is holding you back and dismantle it systematically.", category: 'challenge' },
];

const TONY_STARK_GREETINGS = [
  "JARVIS online. Oh wait, that's me. Welcome back — let's see what we can build today.",
  "Ah, you are back. Good. I was getting bored optimizing alone. Let's get to work.",
  "Status report: You showed up. That is already better than 90% of people. Now let's make it count.",
  "Welcome back. FRIDAY has your schedule ready. Time to be extraordinary — no pressure.",
];

const TONY_STARK_CHALLENGES = [
  "Stark challenge: Build something today — a plan, a solution, a prototype. Create, don't just consume.",
  "Iron Man protocol: Identify your biggest bottleneck and engineer a solution by end of day.",
  "Tech challenge: Automate or optimize one repetitive task in your workflow today.",
  "Endgame challenge: What is the one thing that, if accomplished today, would make everything else easier?",
];

export const MENTOR_DATABASE: Record<string, MentorData> = {
  'Rengoku Kojiro': {
    name: 'Rengoku Kyojuro',
    title: 'Flame Hashira',
    color: '#ff6b35',
    messages: RENGOKU_MESSAGES,
    greetings: RENGOKU_GREETINGS,
    challenges: RENGOKU_CHALLENGES,
  },
  'Naruto Uzumaki': {
    name: 'Naruto Uzumaki',
    title: 'Seventh Hokage',
    color: '#ff9500',
    messages: NARUTO_MESSAGES,
    greetings: NARUTO_GREETINGS,
    challenges: NARUTO_CHALLENGES,
  },
  'Tony Stark': {
    name: 'Tony Stark',
    title: 'Iron Man',
    color: '#c0392b',
    messages: TONY_STARK_MESSAGES,
    greetings: TONY_STARK_GREETINGS,
    challenges: TONY_STARK_CHALLENGES,
  },
};

export function getMentorData(mentorName: string): MentorData {
  // Try exact match first
  if (MENTOR_DATABASE[mentorName]) return MENTOR_DATABASE[mentorName];
  // Try partial match
  const key = Object.keys(MENTOR_DATABASE).find(k =>
    k.toLowerCase().includes(mentorName.toLowerCase()) ||
    mentorName.toLowerCase().includes(k.toLowerCase().split(' ')[0])
  );
  if (key) return MENTOR_DATABASE[key];
  // Default to Rengoku
  return MENTOR_DATABASE['Rengoku Kojiro'];
}

export function getRandomMessage(mentorName: string, category?: MentorMessage['category']): MentorMessage {
  const mentor = getMentorData(mentorName);
  const pool = category
    ? mentor.messages.filter(m => m.category === category)
    : mentor.messages;
  const source = pool.length > 0 ? pool : mentor.messages;
  return source[Math.floor(Math.random() * source.length)];
}

export function getRandomGreeting(mentorName: string): string {
  const mentor = getMentorData(mentorName);
  return mentor.greetings[Math.floor(Math.random() * mentor.greetings.length)];
}

export function getRandomChallenge(mentorName: string): string {
  const mentor = getMentorData(mentorName);
  return mentor.challenges[Math.floor(Math.random() * mentor.challenges.length)];
}

export function getDailyTip(mentorName: string): MentorMessage {
  const mentor = getMentorData(mentorName);
  const tips = mentor.messages.filter(m => m.category === 'tip' || m.category === 'motivation');
  const dayIndex = new Date().getDate() % tips.length;
  return tips[dayIndex] || mentor.messages[0];
}
