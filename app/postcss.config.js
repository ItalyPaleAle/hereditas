const path = require('path')

const production = !process.env.ROLLUP_WATCH

module.exports = {
    plugins: [
        require('postcss-import')(),
        require('tailwindcss')(path.resolve(__dirname, 'tailwind.config.js')),
        require('autoprefixer'),
        ...(production ? [require('@fullhuman/postcss-purgecss')({

            // Specify the paths to all of the template files in your project
            content: [
                path.resolve(__dirname, 'main.html'),
                path.resolve(__dirname, '**/*.svelte'),
                path.resolve(__dirname, '**/*.html'),
            ],

            // Whitelist styles that might be in the content generated from markdown
            whitelist: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'img', 'pre', 'code', 'hr', 'blockquote'],

            // Include any special characters you're using in this regular expression
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        })] : []),
    ],
}
