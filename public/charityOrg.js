const welcomeMsgUser = document.getElementById("userName");

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const decodedToken = jwt_decode(token);
    welcomeMsgUser.innerText = decodedToken.name;
});


const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'homePage.html';
});


const campaignForm = document.getElementById("campaignForm");
const campaignName = document.getElementById("campaignName");
const campaignCategory = document.getElementById("campaignCategory");
const campaignDescription = document.getElementById("campaignDescription");
const campaignLocation = document.getElementById("location");
const campaignGoal = document.getElementById("campaignGoal");
const campaignImage = document.getElementById("campaignImage");
const campaignStartDate = document.getElementById("startDate");
const campaignEndDate = document.getElementById("endDate");

campaignForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("campaignName", campaignName.value);
    formData.append("campaignCategory", campaignCategory.value);
    formData.append("campaignDescription", campaignDescription.value);
    formData.append("campaignLocation", campaignLocation.value);
    formData.append("campaignGoal", campaignGoal.value);
    formData.append("campaignStartDate", campaignStartDate.value);
    formData.append("campaignEndDate", campaignEndDate.value);

    for (const file of campaignImage.files) {
        formData.append("campaignImage", file);
    }

    // for(const [key, value] of formData.entries()){
    //     console.log(key, value);
    // }

    alert("Your campaign is registered, will be available in 24 hrs after admin approval. For any queries contact charityConnect");
    campaignForm.reset();
});