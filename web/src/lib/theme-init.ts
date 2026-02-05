// Theme initialization script
if (typeof window !== 'undefined') {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark')
    } else {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }
}
