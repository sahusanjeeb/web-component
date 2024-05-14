var concat = require('concat');

const files = [
    './dist/metal-chat-bot/runtime.js',
    './dist/metal-chat-bot/polyfills.js',
    // './dist/metal-chat-bot/scripts.js',
    './dist/metal-chat-bot/main.js'
]

concat(files, './dist/app-chats.js')
console.info('Custom elements created successfully!')