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

            try {
                const post = await axios.post('/donor/signup', donorData);
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

            } catch (error) {
                alert(error.response.data.error);
                console.error(error);
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

            try {
                const post = await axios.post('/organization/signup', orgData);
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

            } catch (error) {
                alert(error.response.data.error);
                console.log(error.response.data.error);
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
            window.location.href = "donor.html";

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
            window.location.href = "charityOrg.html";

        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });

});




//admin signup
const adminSignupForm = document.getElementById("adminSignupForm");
const adminSignupName = document.getElementById("adminSignupName");
const adminSignupEmail = document.getElementById("adminSignupEmail");
const adminSignupPassword = document.getElementById("adminSignupPassword");
const adminKey = document.getElementById("adminKey");
const adminSignupBtn = document.getElementById("adminSignupBtn");
const passwordHelp3 = document.getElementById("passwordHelp3");

adminSignupBtn.disabled = true;

adminSignupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const isValidPassword = validatePassword(adminSignupPassword.value);

        if (isValidPassword) {
            const adminData = {
                name: adminSignupName.value,
                email: adminSignupEmail.value,
                adminKey: adminKey.value,
                password: adminSignupPassword.value
            }

            //clearing input fields
            adminSignupName.value = '';
            adminSignupEmail.value = '';
            adminKey.value = '';
            adminSignupPassword.value = '';

            try {
                const post = await axios.post('/admin/signup', adminData);
                alert("Signed up successfully, Login to get started");
                //hide sign-up modal
                const adminSignupModal = bootstrap.Modal.getInstance(document.getElementById('adminSignupModal'));
                adminSignupModal.hide();

                //clearing input fields
                adminSignupName.value = '';
                adminSignupEmail.value = '';
                adminKey.value = '';
                adminSignupPassword.value = '';

            } catch (error) {
                alert(error.response.data.error);
                console.log(error.response.data.error);
            }

        } else {
            passwordHelp3.textContent = "Enter valid password";
            adminSignupBtn.disabled = true;
        }

    } catch (error) {
        console.error(error);
    }
});


adminSignupPassword.addEventListener('keyup', () => {
    const isValidPassword = validatePassword(adminSignupPassword.value);
    if (isValidPassword) {
        passwordHelp3.textContent = "";
        adminSignupBtn.disabled = false;

    } else {
        passwordHelp3.textContent = "Enter valid password";
        adminSignupBtn.disabled = true;
    }
});


//admin login
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginEmail = document.getElementById("adminLoginEmail");
const adminLoginPassword = document.getElementById("adminLoginPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");

adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const adminData = {
        email: adminLoginEmail.value,
        password: adminLoginPassword.value
    }

    adminLoginEmail.value = '';
    adminLoginPassword.value = '';

    axios.post('/admin/login', adminData)
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




//function to check password strength & compatibility
function validatePassword(password) {
    const hasMinimumLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    return hasMinimumLength && hasNumber;
}