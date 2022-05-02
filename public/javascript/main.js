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

        //getting the field info from the user form
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        //posting the user information to the backend
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

        //if we recieve the status as success from the backend, then we redirect the user to the home page
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

//function to add ingredient field
async function addIngredient(e) {

    //getting the ingredients list div-container
    let ingredientList = document.querySelector('.ingredientList');

    //getting the ingredient input
    let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];

    //cloning the ingredient input
    let newIngredientDiv = ingredientDiv.cloneNode(true);


    let inputs = newIngredientDiv.querySelectorAll('input');

    //clearing the inputs of the cloned field, so that it becomes empty to take new inputs
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }

    //appending the ingredient input to the ingredientslist div 
    ingredientList.appendChild(newIngredientDiv);

}

async function handleLikeClick(e) {
    try {

        //if the user is loggedin
        if (loggedIn === 'true') {
            //getting the icon cliked
            let likeIcon = e.target;
            let likeIconText = likeIcon.querySelector('p');

            //if the checking if the icon is liked
            if (likeIcon.classList.contains('bi-heart-fill')) {
                //removing all the classes of the icon
                likeIcon.className = '';

                //making the icon to look unliked, by updating the classes of the icon
                likeIcon.className += 'bi bi-heart';

                //decrementing the likes by 1 on the user interface
                likeIconText.innerHTML = parseInt(likeIconText.innerText) - 1;

                //getting the recipe id of the recipe whhose likes is to be updated, fromt he data attribute
                const recipeId = likeIcon.getAttribute('data-id');

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
                //adding the class to make the like icon to look like liked
                likeIcon.className += '-fill';

                //incrementing the likes by 1
                likeIconText.innerHTML = parseInt(likeIconText.innerText) + 1;

                //we get the recipeId on which the like button is clicked
                const recipeId = likeIcon.getAttribute('data-id');

                //sending the request to the backend to like and also to add the recipe to 
                // the user's list of liked recipes the recipe by sending the recipe id
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

//function to handle save button click
async function handleSaveClick(e) {
    try {
        //if the user is loggedin
        if (loggedIn === 'true') {

            //getting the icon element which is  clicked
            let saveIcon = e.target;


            //we check if the save icon is saved or unsaved

            //if it is saved
            if (saveIcon.classList.contains('bi-bookmarks-fill')) {

                //then we remove all the classes from the icon
                saveIcon.className = '';

                //we put classes to make it unsaved
                saveIcon.className += 'bi bi-bookmarks';

                //we get the recipeId on which the like button is clicked
                const recipeId = saveIcon.getAttribute('data-id');

                //sending the request to the backend to unsave and also to remove the recipe from 
                // the user's list of saved recipes the recipe by sending the recipe id
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

                //we do vice versa of what we did above
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

//getting the recipe author's profile
async function handleAuthorClick(e) {
    try {
        const target = e.target;
        let authorId = target.getAttribute('data-id');
        window.location.assign('/auth/profile/' + authorId)

    } catch (error) {
        console.log("Error fetching user profile");
        alert("Error fetching user profile");
    }
}