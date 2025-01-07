/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./src/**/*.{html,js,vue}",
        "./src/pages/**/*.{html,js,vue}",
        "./src/components/**/*.{html,js,vue}"
    ],
    corePlugins: {
        preflight: false // 禁用preflight以避免与uni-app默认样式冲突
    },
    theme: {
        extend: {},
    },
    plugins: [],
};
