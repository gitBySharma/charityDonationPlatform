const orgName = document.getElementById("orgName");
const orgEmail = document.getElementById("orgEmail");
const orgPhone = document.getElementById("orgPhone");
const orgCategory = document.getElementById("orgCategory");
const orgDescription = document.getElementById("orgDescription");
const orgGoal = document.getElementById("orgGoal");
const editProfileBtn = document.getElementById("editProfileBtn");


const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'homePage.html';
});


document.addEventListener("DOMContentLoaded", async (event) => {
    const orgData = await fetchProfileDetails();
    displayProfileData(orgData);
});



async function fetchProfileDetails() {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get('/org/profile', { headers: { "Authorization": token } });
        if (response.data.success) {
            return response.data.orgProfileData;

        } else {
            return null;
        }

    } catch (error) {
        console.log(error);
        alert("Error fetching profile details");
    }
}


function displayProfileData(orgData) {
    orgName.innerText = orgData.name;
    orgEmail.innerText = orgData.email;
    orgPhone.innerText = orgData.phone;
    orgCategory.innerText = orgData.category;
    orgDescription.innerText = orgData.description;
    orgGoal.innerText = orgData.goal;

}



editProfileBtn.addEventListener('click', () => {
    // Populate modal fields with current profile data
    document.getElementById("modalOrgName").value = orgName.innerText;
    document.getElementById("modalOrgEmail").value = orgEmail.innerText;
    document.getElementById("modalOrgPhone").value = orgPhone.innerText;
    document.getElementById("modalOrgCategory").value = orgCategory.innerText;
    document.getElementById("modalOrgDescription").value = orgDescription.innerText;
    document.getElementById("modalOrgGoal").value = orgGoal.innerText;

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();
});


const saveProfileBtn = document.getElementById("saveProfileBtn");

saveProfileBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    try {
        const updatedData = {
            name: document.getElementById("modalOrgName").value,
            email: document.getElementById("modalOrgEmail").value,
            phone: document.getElementById("modalOrgPhone").value,
            category: document.getElementById("modalOrgCategory").value,
            description: document.getElementById("modalOrgDescription").value,
            goal: document.getElementById("modalOrgGoal").value
        };

        const response = await axios.put("/charityOrgProfile/edit/", updatedData, { headers: { "Authorization": token } });
        if (response.data.success) {
            alert("Profile updated successfully");
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();
            window.location.reload();

        } else {
            alert("Failed to update profile");
        }

    } catch (error) {
        console.error(error);
        alert("Failed to update profile");

    }

});



const changePasswordForm = document.getElementById("changePasswordForm");
const changePasswordBtn = document.getElementById("changePasswordBtn");
changePasswordBtn.disabled = true;
changePasswordBtn.style.cursor = "not-allowed";

changePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    try {
        if (newPassword != confirmNewPassword) {
            alert("Passwords do not match");
            changePasswordBtn.disabled = true;
            return;
        }

        if (currentPassword === newPassword) {
            alert("New password cannot be the same as the current password");
            changePasswordBtn.disabled = true;
            return;
        }

        const isValidPassword = validatePassword(newPassword);
        if (isValidPassword) {
            changePasswordForm.reset();

            try {
                const response = await axios.post("/charityOrgProfile/changePassword/", { currentPassword, newPassword }, { headers: { "Authorization": token } });
                alert("Password changed successfully");
                window.location.reload();

            } catch (error) {
                alert(error.response.data.error);
                console.error(error);
            }

        } else {
            document.getElementById("passwordHelp").textContent = "Enter a valid password";
            changePasswordBtn.disabled = true;
            changePasswordBtn.style.cursor = "not-allowed";

        }

    } catch (error) {
        console.error(error);
    }
});

document.getElementById("newPassword").addEventListener('keyup', () => {
    const isValidPassword = validatePassword(document.getElementById("newPassword").value);
    if (isValidPassword) {
        passwordHelp.textContent = "";
        changePasswordBtn.disabled = false;
        changePasswordBtn.style.cursor = "default";

    } else {
        passwordHelp.textContent = "Enter valid password";
        changePasswordBtn.disabled = true;
        changePasswordBtn.style.cursor = "not-allowed";
    }
});

//function to check password strength & compatibility
function validatePassword(password) {
    const hasMinimumLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    return hasMinimumLength && hasNumber;
}


