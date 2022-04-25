
// Register
async function handleRegister(e) {

    try {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/auth/register', {
            method: 'POST',
            cors: 'same',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name': name,
                'email': email,
                'password': password
            })
        });

        const jsonResp=await response.json();

        if(jsonResp.status==="success"){
            window.location.assign('/');
        }

    } catch (error) {
        alert(error);
    }
}