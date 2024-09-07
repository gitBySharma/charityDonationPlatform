//donor signup
const donorSignupForm = document.getElementById('donorSignupForm');
const donorSignupName = document.getElementById("donorName");
const donorSignupEmail = document.getElementById("donorEmail");
const donorSignupPhone = document.getElementById("donorPhone");
const donorSignupPassword = document.getElementById("donorPassword");
const donorSignupConfirmPassword = document.getElementById("confirmDonorPassword");
const passwordHelp1 = document.getElementById("passwordHelp1");
const donorSignupBtn = document.getElementById("donorSignupBtn");

donorSignupBtn.disabled = true;

donorSignupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        if (donorSignupPassword.value != donorSignupConfirmPassword.value) {
            alert("Password doesn't match, enter again");
            return;
        }

        const isValidPassword = validatePassword(donorSignupPassword.value);

        if (isValidPassword) {
            const donorData = {
                name: donorSignupName.value,
                email: donorSignupEmail.value,
                phone: donorSignupPhone.value,
                password: donorSignupPassword.value
            }

            //clearing input fields
            donorSignupName.value = '';
            donorSignupEmail.value = '';
            donorSignupPhone.value = '';
            donorSignupPassword.value = '';
            donorSignupConfirmPassword.value = '';

            const post = await axios.post('/donor/signup', donorData);
            if (post) {
                alert("Signed up successfully, Login to get started");
                //hide sign-up modal
                const donorModal = bootstrap.Modal.getInstance(document.getElementById('donorModal'));
                donorModal.hide();
                // // Show sign-in modal
                // document.getElementById('signupModal').addEventListener('hidden.bs.modal', function () {
                //     let loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                //     loginModal.show();
                // });

                //clearing input fields
                donorSignupName.value = '';
                donorSignupEmail.value = '';
                donorSignupPhone.value = '';
                donorSignupPassword.value = '';
                donorSignupConfirmPassword.value = '';

            } else {
                alert("Failed to sign up" + post.data.error);
            }

        } else {
            passwordHelp1.textContent = "Enter valid password";
            donorSignupBtn.disabled = true;
        }

    } catch (error) {
        console.error(error);
    }
});

donorSignupPassword.addEventListener('keyup', () => {
    const isValidPassword = validatePassword(donorSignupPassword.value);
    if (isValidPassword) {
        passwordHelp1.textContent = "";
        donorSignupBtn.disabled = false;

    } else {
        passwordHelp1.textContent = "Enter valid password";
        donorSignupBtn.disabled = true;
    }
});



//organization signup
const orgSignupForm = document.getElementById('orgSignupForm');
const orgSignupName = document.getElementById("orgName");
const orgSignupEmail = document.getElementById("orgEmail");
const orgSignupPhone = document.getElementById("orgPhone");
const orgCategory = document.querySelector(".chooseCategory");
const orgSignupDescription = document.getElementById("description");
const orgSignupGoal = document.getElementById("goal");
const orgSignupPassword = document.getElementById("orgPassword");
const orgSignupConfirmPassword = document.getElementById("confirmOrgPassword");
const passwordHelp2 = document.getElementById("passwordHelp2");
const orgSignupBtn = document.getElementById("orgSignupBtn");


orgSignupBtn.disabled = true;

orgSignupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        if (orgSignupPassword.value != orgSignupConfirmPassword.value) {
            alert("Password doesn't match, enter again");
            return;
        }

        const isValidPassword = validatePassword(orgSignupPassword.value);

        if (isValidPassword) {
            const orgData = {
                name: orgSignupName.value,
                email: orgSignupEmail.value,
                phone: orgSignupPhone.value,
                category: orgCategory.value,
                description: orgSignupDescription.value,
                goal: orgSignupGoal.value,
                password: orgSignupPassword.value
            }

            //clearing input fields
            orgSignupName.value = '';
            orgSignupEmail.value = '';
            orgSignupPhone.value = '';
            orgSignupDescription.value = '';
            orgSignupGoal.value = '';
            orgSignupPassword.value = '';
            orgSignupConfirmPassword.value = '';

            const post = await axios.post('/organization/signup', orgData);
            if (post) {
                alert("Signed up successfully, Login to get started");
                //hide sign-up modal
                const orgModal = bootstrap.Modal.getInstance(document.getElementById('orgModal'));
                orgModal.hide();
                // // Show sign-in modal
                // document.getElementById('signupModal').addEventListener('hidden.bs.modal', function () {
                //     let loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                //     loginModal.show();
                // });

                //clearing input fields
                orgSignupName.value = '';
                orgSignupEmail.value = '';
                orgSignupPhone.value = '';
                orgSignupDescription.value = '';
                orgSignupGoal.value = '';
                orgSignupPassword.value = '';
                orgSignupConfirmPassword.value = '';

            } else {
                alert("Failed to sign up" + post.data.error);
            }

        } else {
            passwordHelp2.textContent = "Enter valid password";
            orgSignupBtn.disabled = true;
        }

    } catch (error) {
        console.error(error);
    }
});

orgSignupPassword.addEventListener('keyup', () => {
    const isValidPassword = validatePassword(orgSignupPassword.value);
    if (isValidPassword) {
        passwordHelp2.textContent = "";
        orgSignupBtn.disabled = false;

    } else {
        passwordHelp2.textContent = "Enter valid password";
        orgSignupBtn.disabled = true;
    }
});




//donor login
const donorLoginForm = document.getElementById("donorLoginForm");
const donorLoginEmail = document.getElementById("donorLoginEmail");
const donorLoginPassword = document.getElementById("donorLoginPassword");

donorLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const donorData = {
        email: donorLoginEmail.value,
        password: donorLoginPassword.value
    }

    donorLoginEmail.value = '';
    donorLoginPassword.value = '';

    axios.post('/donor/login', donorData)
        .then((result) => {
            alert("Logged in successfully");
            localStorage.setItem('token', result.data.token);
            window.location.href = "#";

        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });

});


//organization login
const orgLoginForm = document.getElementById("orgLoginForm");
const orgLoginEmail = document.getElementById("orgLoginEmail");
const orgLoginPassword = document.getElementById("orgLoginPassword");

orgLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const orgData = {
        email: orgLoginEmail.value,
        password: orgLoginPassword.value
    }

    orgLoginEmail.value = '';
    orgLoginPassword.value = '';

    axios.post('/organization/login', orgData)
        .then((result) => {
            alert("Logged in successfully");
            localStorage.setItem('token', result.data.token);
            window.location.href = "#";

        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });

});



//admin signup and login



//function to check password strength & compatibility
function validatePassword(password) {
    const hasMinimumLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    return hasMinimumLength && hasNumber;
}