const btnToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

btnToggle.addEventListener('click', () => {
    nav.classList.toggle('hidden');
});

export default { init }