
const logout = document.getElementById('logout-anchor');

logout?.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('user');
    requestLogOut();
})

async function requestLogOut() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            console.log('successful', data.message);
            window.location.href = `index.html`;
        }
        else {
            console.error('unsuccesful response', data.message);
        }
    }
    catch (err) {
        console.error('unsuccessful', err);
    }
}
