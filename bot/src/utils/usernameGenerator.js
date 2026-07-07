
const adjectives = ['Happy', 'Cool', 'Super', 'Fast', 'Wild', 'Crazy', 'Epic', 'Chill', 'Silent', 'Brave', 'Sunny', 'Dark', 'Bright', 'Neon', 'Urban', 'Cosmic'];
const nouns = ['Panda', 'Tiger', 'Ninja', 'Gamer', 'Star', 'Wolf', 'Eagle', 'Ghost', 'Rider', 'Vibe', 'Wave', 'Falcon', 'Dragon', 'Pixel', 'Sonic'];

export const generateUniqueUsername = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 10000);

    // Format: HappyTiger1234 or happy_tiger_1234
    const formats = [
        `${adj}${noun}${number}`,
        `${adj.toLowerCase()}_${noun.toLowerCase()}${number}`,
        `${noun}${adj}${number}`,
        `${noun.toLowerCase()}.${adj.toLowerCase()}.${number}`
    ];

    return formats[Math.floor(Math.random() * formats.length)];
};
