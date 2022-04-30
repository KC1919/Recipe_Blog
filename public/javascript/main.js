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

async function addIngredient(e) {
    let ingredientList = document.querySelector('.ingredientList');
    let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];
    let newIngredientDiv = ingredientDiv.cloneNode(true);

    let inputs = newIngredientDiv.querySelectorAll('input');

    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }

    ingredientList.appendChild(newIngredientDiv);

}

async function handleLikeClick(e) {
    try {
        console.log(loggedIn);
        if (loggedIn === 'true') {
            let likeIcon = e.target;
            let likeIconText = likeIcon.querySelector('p');
            // console.log(likeIcon);
            // console.log(likeIconText);

            if (likeIcon.classList.contains('bi-heart-fill')) {
                likeIcon.className = '';
                likeIcon.className += 'bi bi-heart';

                likeIconText.innerHTML = parseInt(likeIconText.innerText) - 1;
                // console.log(likeIconText.innerHTML);

                const recipeId = likeIcon.getAttribute('data-id');
                console.log(recipeId);

                const response = await fetch('/decrement-likes/', {
                    method: 'POST',
                    cors: 'same',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipeId: recipeId
                    }),
                });

                const jsonResp = await response.json();
                console.log(jsonResp);
            } else {
                likeIcon.className += '-fill';
                likeIconText.innerHTML = parseInt(likeIconText.innerText) + 1;

                const recipeId = likeIcon.getAttribute('data-id');
                console.log(recipeId);

                const response = await fetch('/increment-likes/', {
                    method: 'POST',
                    cors: 'same',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipeId: recipeId
                    }),
                });

                const jsonResp = await response.json();
                console.log(jsonResp);
            }
        } else {
            window.location.assign('/auth/login');
        }
    } catch (error) {
        console.log(error);
        alert(error);
    }
}

async function handleSaveClick(e) {
    try {
        if (loggedIn === 'true') {
            let saveIcon = e.target;
            console.log(saveIcon);


            if (saveIcon.classList.contains('bi-bookmarks-fill')) {
                saveIcon.className = '';
                saveIcon.className += 'bi bi-bookmarks';

                const recipeId = saveIcon.getAttribute('data-id');
                console.log(recipeId);

                const response = await fetch('/unsave-recipe/', {
                    method: 'POST',
                    cors: 'same',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipeId: recipeId
                    }),
                });

                const jsonResp = await response.json();
                console.log(jsonResp);
            } else {
                saveIcon.className += '-fill';
                const recipeId = saveIcon.getAttribute('data-id');
                console.log(recipeId);

                const response = await fetch('/save-recipe/', {
                    method: 'POST',
                    cors: 'same',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipeId: recipeId
                    }),
                });

                const jsonResp = await response.json();
                console.log(jsonResp);
            }
        } else {
            window.location.assign('/auth/login');
        }
    } catch (error) {
        console.log(error);
        // alert(error);
    }
}

async function handleAuthorClick(e) {
    try {
        const target = e.target;

        let authorId = target.getAttribute('data-id');
        console.log(authorId);
        // console.log(e.target);
        console.log("before");

        window.location.assign('/auth/profile/' + authorId)
        // const response = await fetch(`/auth/profile/${authorId}`, {
        //     method: 'GET',
        //     cors: 'same',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        // });

        // console.log("after");

        // let jsonResp = await response.json();

        // if (jsonResp.status === "success"){
        //     // window.location.assign('/auth/profile/'+authorId)
        // }
        // console.log(jsonResp);

    } catch (error) {
        console.log("Error fetching user profile");
        alert("Error fetching user profile");
    }
}