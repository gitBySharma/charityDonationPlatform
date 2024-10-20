const welcomeMsgUser = document.getElementById("userName");

document.addEventListener("DOMContentLoaded", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const decodedToken = jwt_decode(token);
    welcomeMsgUser.innerText = decodedToken.name;
    fetchUnapprovedCampaigns();
    fetchApprovedCampaigns();
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
                <div class="col-12"> <!-- Changed to full width for consistency -->
                    <div class="card h-100"> <!-- Added h-100 for full height -->
                        <div class="card-body d-flex flex-column"> <!-- Added flex properties -->
                            <h5 class="card-title">${campaign.campaignName}</h5>
                            <p class="card-text"><strong>Location: </strong>${campaign.campaignLocation}</p>
                            <p class="card-text"><strong>Category: </strong>${campaign.campaignCategory}</p>
                            <p class="card-text"><strong>Goal: </strong>₹ ${campaign.campaignGoal}</p>
                            <p class="card-text"><strong>Description: </strong>${campaign.campaignDescription}</p>
                            <p class="card-text"><strong>Uploaded Documents:</strong><br>${documentLinks}</p>
                            <p class="card-text"><strong>Charity Org. Name: </strong>${campaign.charityOrgName}</p>
                            <div class="btn-group mt-auto"> <!-- Added btn-group and mt-auto -->
                                <button class="btn btn-outline btn-success" data-id="${campaign.id}">Approve</button>
                                <button class="btn btn-outline btn-danger" data-id="${campaign.id}">Reject</button>
                            </div>
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
                await handleCampaignApproval(campaignId, true);
            });
        });

        document.querySelectorAll('.btn-danger').forEach(button => {
            button.addEventListener('click', async (event) => {
                const campaignId = event.target.getAttribute('data-id');
                const confirmed = window.confirm("Are you sure you want to reject the campaign?");
                if (confirmed) {
                    await handleCampaignApproval(campaignId, false);
                } else {
                    return;
                }

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


async function fetchApprovedCampaigns() {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/admin/getApprovedCampaigns', { headers: { "Authorization": token } });
        const approvedCampaigns = response.data.campaignData;

        const approvedCampaignsSection = document.getElementById('approvedCampaignsSection');
        const sectionContainer = approvedCampaignsSection.querySelector('.section-container');
        sectionContainer.innerHTML = ''; // Clear existing content

        if (approvedCampaigns.length === 0) {
            sectionContainer.innerHTML = '<p>No approved campaigns available.</p>';
            return;
        }

        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'g-3'); // Bootstrap row with gap between cards

        approvedCampaigns.forEach(campaign => {
            const campaignCard = `
                <div class="col-12"> <!-- Full-width for each card -->
                    <div class="card h-100"> <!-- h-100 for full height consistency -->
                        <div class="card-body d-flex flex-column"> <!-- Flex for full card structure -->
                            <h5 class="card-title">${campaign.campaignName}</h5>
                            <p class="card-text"><strong>Location: </strong>${campaign.campaignLocation}</p>
                            <p class="card-text"><strong>Category: </strong>${campaign.campaignCategory}</p>
                            <p class="card-text"><strong>Goal: </strong>₹ ${campaign.campaignGoal}</p>
                            <p class="card-text"><strong>Fund Raised: </strong>₹ ${campaign.fundRaised}</p>
                            <p class="card-text"><strong>Charity Org. Name: </strong>${campaign.charityOrgName}</p>
                            <div class="btn-group mt-auto"> <!-- Added btn-group and mt-auto for buttons -->
                                <button class="btn btn-sm btn-outline-danger" data-id="${campaign.id}">Terminate Campaign</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            rowDiv.innerHTML += campaignCard; // Append each card to the row
        });

        sectionContainer.appendChild(rowDiv); // Append the row to the container

        // Add event listeners for "Terminate Campaign" buttons
        document.querySelectorAll('.btn-outline-danger').forEach(button => {
            button.addEventListener('click', async (event) => {
                const campaignId = event.target.getAttribute('data-id');
                const confirmed = window.confirm("Are you sure you want to terminate the campaign?");
                if (confirmed) {
                    await handleCampaignTermination(campaignId);
                } else {
                    return;
                }
            });
        });

    } catch (error) {
        console.log("Error fetching approved campaigns:", error);
        alert("Failed to load approved campaigns.");
    }
}

async function handleCampaignTermination(campaignId) {
    try {
        const token = localStorage.getItem("token");

        await axios.post('/admin/terminateCampaign', { campaignId }, { headers: { "Authorization": token } });
        alert("Campaign terminated successfully.");

        fetchApprovedCampaigns(); // Reload approved campaigns after termination

    } catch (error) {
        console.log("Error terminating campaign:", error);
        alert("Failed to terminate the campaign.");
    }
}