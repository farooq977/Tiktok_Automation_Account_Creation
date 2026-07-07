// Generate random password
export const generatePassword = (minLength = 8, maxLength = 20) => {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    // Ensure password contains at least one of each type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    console.log(`🔑 Generated password: ${password.substring(0, 3)}${'*'.repeat(password.length - 3)}`);
    return password;
};

export default {
    generatePassword,
};
