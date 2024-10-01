const welcomeMsgUser = document.getElementById("userName");

document.addEventListener("DOMContentLoaded", (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const decodedToken = jwt_decode(token);
    welcomeMsgUser.innerText = decodedToken.name;

    fetchApprovedCampaigns();
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

campaignForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("campaignName", campaignName.value);
    formData.append("campaignCategory", campaignCategory.value);
    formData.append("campaignDescription", campaignDescription.value);
    formData.append("campaignLocation", campaignLocation.value);
    formData.append("campaignGoal", campaignGoal.value);
    formData.append("campaignStartDate", campaignStartDate.value);
    formData.append("campaignEndDate", campaignEndDate.value);

    for (const file of campaignImage.files) {
        formData.append("file", file);
    }

    const response = await axios.post('/campaign/register', formData, { headers: { 'Authorization': token } });

    if (response.data.success) {
        alert("Your campaign is registered, will be available in 24 hrs after admin approval. For any queries contact charityConnect");
        campaignForm.reset();

    } else {
        alert("Failed to register campaign");
    }

});


async function fetchApprovedCampaigns() {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get('/campaign/approved', { headers: { "Authorization": token } });
        const campaigns = response.data.campaigns;

        const campaignsList = document.getElementById('campaignsList');
        campaignsList.innerHTML = ''; // Clear existing campaigns

        campaigns.forEach(campaign => {
            const campaignCard = `
                <div class="card mb-3">
                    <img src="img/charity.jpg" class="card-img-top" alt="Campaign Image">
                    <div class="card-body">
                        <h5 class="card-title">${campaign.campaignName}</h5>
                        <p class="card-text">${campaign.campaignDescription}</p>
                        <p class="card-text">Fund Raised: ₹ ${campaign.fundRaised} / ₹ ${campaign.campaignGoal}</p>
                    </div>
                </div>
            `;
            campaignsList.innerHTML += campaignCard;
        });
    } catch (error) {
        console.error('Error fetching approved campaigns:', error);
        alert("Error fetching campaigns");
    }
};