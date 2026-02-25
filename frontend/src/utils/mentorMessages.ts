interface MentorData {
    messages: string[];
    schedulePrompts: string[];
    style: string;
    color: string;
}

const mentorDatabase: Record<string, MentorData> = {
    'rengoku kojiro': {
        messages: [
            "SET YOUR HEART ABLAZE! No matter how many times you are knocked down, stand up and face forward!",
            "A person who has a dream must be prepared to fight for it with everything they have!",
            "Weakness is not shameful. Giving up is! Now rise and train harder!",
            "The flame of your spirit burns bright! Do not let it be extinguished by doubt!",
            "Those who are weak must become strong. Those who are strong must protect the weak!",
            "Every breath you take is a chance to become stronger. Use it wisely!",
            "Your schedule is your sword. Wield it with discipline and purpose!",
            "UMAI! You have made progress today. Keep that fire burning!",
        ],
        schedulePrompts: [
            "Have you set your training schedule for today? A warrior without a plan is a warrior half-defeated!",
            "What tasks burn brightest on your agenda? Let us conquer them with the Flame Breathing technique!",
            "Time is precious, like the flame that burns. Have you planned your day?",
        ],
        style: 'flame',
        color: 'gold',
    },
    'naruto uzumaki': {
        messages: [
            "Believe it! You can do anything if you never give up!",
            "I'm not gonna run away, I never go back on my word! That's my nindo, my ninja way!",
            "Hard work is worthless for those that don't believe in themselves.",
            "When people are protecting something truly special to them, they truly can become... as strong as they can be.",
        ],
        schedulePrompts: [
            "Dattebayo! Have you planned your training for today?",
            "A ninja who doesn't follow their schedule is like a kunai without a target!",
        ],
        style: 'energy',
        color: 'cyan',
    },
    'goku': {
        messages: [
            "Power comes in response to a need, not a desire. You have to create that need!",
            "I am the hope of the universe. I am the answer to all living things that cry out for peace!",
            "Every time I reach a new level of strength, I discover there's always a higher level!",
            "Push past your limits. That's where true power lies!",
        ],
        schedulePrompts: [
            "Have you trained today? Even a Saiyan needs a schedule!",
            "What's your power level today? Let's plan to increase it!",
        ],
        style: 'power',
        color: 'cyan',
    },
    'tony stark': {
        messages: [
            "Genius, billionaire, playboy, philanthropist — and I still follow a schedule.",
            "Part of the journey is the end. Make sure your journey is worth it.",
            "I am Iron Man. And so are you, when you commit to your goals.",
            "Sometimes you gotta run before you can walk. But first, you need a plan.",
        ],
        schedulePrompts: [
            "JARVIS, remind the user to check their task list. Oh wait, that's you.",
            "What's on the agenda today? Even I use a calendar.",
        ],
        style: 'tech',
        color: 'cyan',
    },
    'default': {
        messages: [
            "Every great achievement begins with a single step. Take yours today.",
            "Discipline is the bridge between goals and accomplishment.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The secret of getting ahead is getting started.",
            "Focus on progress, not perfection.",
        ],
        schedulePrompts: [
            "Have you planned your tasks for today?",
            "What are your top priorities right now?",
            "Let's organize your schedule for maximum productivity.",
        ],
        style: 'default',
        color: 'cyan',
    },
};

export function getMentorMessage(mentorName: string): string {
    const key = mentorName.toLowerCase();
    const data = mentorDatabase[key] || mentorDatabase['default'];
    const messages = data.messages;
    return messages[Math.floor(Math.random() * messages.length)];
}

export function getMentorSchedulePrompt(mentorName: string): string {
    const key = mentorName.toLowerCase();
    const data = mentorDatabase[key] || mentorDatabase['default'];
    const prompts = data.schedulePrompts;
    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getMentorStyle(mentorName: string): string {
    const key = mentorName.toLowerCase();
    return (mentorDatabase[key] || mentorDatabase['default']).style;
}

export function getMentorColor(mentorName: string): string {
    const key = mentorName.toLowerCase();
    return (mentorDatabase[key] || mentorDatabase['default']).color;
}
