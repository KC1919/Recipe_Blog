// Register Functions
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

        const jsonResp = await response.json();

        if (jsonResp.status === "success") {
            window.location.assign('/');
        }

    } catch (error) {
        alert(error);
    }
}



// Login Functions
async function handleLogin(e) {

    try {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/auth/login', {
            method: 'POST',
            cors: 'same',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'email': email,
                'password': password
            })
        });

        const jsonResp = await response.json();

        if (jsonResp.status === "success") {
            window.location.assign('/');
        } else if (jsonResp.status === "failure") {

            alert(jsonResp.message);
            setTimeout(async () => {
                window.location.reload();
            }, 100);

        }

    } catch (error) {
        alert(error);
    }
}

let addIngredientBtn = document.getElementById('addIngredientBtn');
let ingredientList = document.querySelector('.ingredientList');
let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];

addIngredientBtn.addEventListener('click', function () {
    let newIngredient = ingredientDiv.cloneNode(true);
    let input = newIngredient.getElementsByTagName('input')[0];
    input.value = '';
    ingredientList.appendChild(newIngredient);
})