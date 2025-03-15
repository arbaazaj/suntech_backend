document.getElementById('registrationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this); // Use FormData to gather all form fields

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        body: formData, // Do not set Content-Type header
    });

    const data = await response.json();
    const messageDiv = document.getElementById('message');

    if (response.ok) {
        messageDiv.innerHTML = `<p>Registration successful! User ID: ${data.id}</p>`;
        document.getElementById('registrationForm').reset();
    } else {
        messageDiv.innerHTML = `<p>Error: ${data.error}</p>`;
    }
});