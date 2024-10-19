const welcomeMsgUser = document.getElementById("userName");

document.addEventListener("DOMContentLoaded", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const decodedToken = jwt_decode(token);
    welcomeMsgUser.innerText = decodedToken.name;
    fetchUnapprovedCampaigns();
});


const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'homePage.html';
});


async function fetchUnapprovedCampaigns() {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/admin/getUnapprovedCampaigns', { headers: { "Authorization": token } });
        const unapprovedCampaigns = response.data.campaignData;

        const unapprovedCampaignsSection = document.getElementById('unapprovedCampaignsSection');
        const sectionContainer = unapprovedCampaignsSection.querySelector('.section-container');
        sectionContainer.innerHTML = ''; // Clear existing content

        if (unapprovedCampaigns.length === 0) {
            sectionContainer.innerHTML = '<p>No unapproved campaigns available.</p>';
            return;
        }

        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'g-3'); // Bootstrap row with gap between cards

        unapprovedCampaigns.forEach(campaign => {
            const documentUrl = campaign.uploadedDocumentUrl;
            let documentLinks = '';
            if (Array.isArray(documentUrl)) {
                documentUrl.forEach((url, index) => {
                    documentLinks += `<a href="${url}" target="_blank">Document ${index + 1}</a><br>`;
                });
            }

            const campaignCard = `
                <div class="col-md-4"> <!-- Bootstrap column for responsiveness -->
                    <div class="card h-100"> <!-- 'h-100' to make cards the same height -->
                        <div class="card-body">
                            <h5 class="card-title">${campaign.campaignName}</h5>
                            <p class="card-text"><strong>Location: </strong>${campaign.campaignLocation}</p>
                            <p class="card-text"><strong>Category: </strong>${campaign.campaignCategory}</p>
                            <p class="card-text"><strong>Goal: </strong>₹ ${campaign.campaignGoal}</p>
                            <p class="card-text"><strong>Description: </strong>${campaign.campaignDescription}</p>
                            <p class="card-text"><strong>Uploaded Documents:</strong><br>${documentLinks}</p>
                            <p class="card-text"><strong>Charity Org. Name: </strong>${campaign.charityOrgName}</p>
                            <button class="btn btn-success" data-id="${campaign.id}">Approve</button>
                            <button class="btn btn-danger" data-id="${campaign.id}">Reject</button>
                        </div>
                    </div>
                </div>
            `;

            rowDiv.innerHTML += campaignCard; // Append the card to the row
        });

        sectionContainer.appendChild(rowDiv); // Append the row to the section container

        // Add event listeners for approve/reject buttons
        document.querySelectorAll('.btn-success').forEach(button => {
            button.addEventListener('click', async (event) => {
                const campaignId = event.target.getAttribute('data-id');
                // await handleCampaignApproval(campaignId, true);
            });
        });

        document.querySelectorAll('.btn-danger').forEach(button => {
            button.addEventListener('click', async (event) => {
                const campaignId = event.target.getAttribute('data-id');
                // await handleCampaignApproval(campaignId, false);
            });
        });

    } catch (error) {
        console.log("Error fetching unapproved campaigns:", error);
        alert("Failed to load unapproved campaigns.");
    }
}





async function handleCampaignApproval(campaignId, isApproved) {
    try {
        const token = localStorage.getItem("token");
        const approvalUrl = isApproved ? '/admin/approveCampaign' : '/admin/rejectCampaign';
        await axios.post(approvalUrl, { campaignId }, { headers: { "Authorization": token } });

        alert(isApproved ? "Campaign approved" : "Campaign rejected");
        await fetchUnapprovedCampaigns(); // Reload campaigns after approval/rejection
    } catch (error) {
        console.error("Error during campaign approval/rejection:", error);
        alert("Action failed. Please try again.");
    }
}