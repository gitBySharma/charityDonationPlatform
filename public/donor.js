const welcomeMsgUser = document.getElementById("userName");

document.addEventListener("DOMContentLoaded", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const decodedToken = jwt_decode(token);
    welcomeMsgUser.innerText = decodedToken.name;

    await fetchCampaigns();
});


const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'homePage.html';
});



async function fetchCampaigns() {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/donors/getCampaigns', { headers: { "Authorization": token } });
        const campaigns = response.data.campaigns;
        const campaignsList = document.getElementById('campaignsList');
        campaignsList.innerHTML = ''; // Clear existing

        campaigns.forEach(campaign => {
            const campaignCard = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="img/charity.jpg" class="card-img-top" alt="Campaign Image">
                        <div class="card-body">
                            <h5 class="card-title">${campaign.campaignName}</h5>
                            <p class="card-text"><strong>Description: </strong>${campaign.campaignDescription}</p>
                            <p class="card-text"><strong>Description: </strong>${campaign.campaignCategory}</p>
                            <p class="card-text"><strong>Location: </strong>${campaign.campaignLocation}</p>
                            <p class="card-text"><strong>Fund Raised: </strong> ₹ ${campaign.fundRaised} / ₹ ${campaign.campaignGoal}</p>
                            <p class="card-text"><strong>Available Till: </strong> ${campaign.campaignEndDate.slice(0, 10)} </p>
                            <button class="btn btn-primary w-100 donateNowBtn" data-bs-toggle="modal" data-bs-target="#donateModal" data-id="${campaign.id}">Donate Now</button>
                        </div>
                    </div>
                </div>
            `;
            campaignsList.innerHTML += campaignCard;

            // Attach an event listener for the "Donate Now" button
            const donateButtons = document.querySelectorAll('.donateNowBtn');
            donateButtons.forEach(button => {
                button.addEventListener('click', function (event) {
                    const campaignId = event.currentTarget.dataset.id;
                    // Store the campaignId in a global variable or in a hidden input
                    document.getElementById("payBtn").dataset.campaignId = campaignId; // Store it in the pay button
                });
            });

        });
    } catch (error) {
        alert(error.response.data.error);
        console.error("Error fetching campaigns:", error);
    }
};



//handling donations
document.getElementById('payBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const donationAmount = document.getElementById("donationAmount").value;
    if (!donationAmount || donationAmount <= 0) {
        alert("Please enter a valid donation amount");
        return;
    }
    const campaignId = document.getElementById("payBtn").dataset.campaignId;
    console.log("campaign", campaignId);

    const token = localStorage.getItem("token");
    const response = await axios.post('/donors/donate', { donationAmount: donationAmount, campaignId: campaignId }, { headers: { "Authorization": token } });

    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,

        "handler": async function (response) {
            await axios.post('/donor/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
                donationAmount: donationAmount,
                campaignId: campaignId
            }, { headers: { 'Authorization': token } });

            //updating local storage with premium status
            if (response.razorpay_payment_id) {
                alert("Donation successful");
                document.getElementById("donationAmount").value = "";
                //hide sign-up modal
                const donateModal = bootstrap.Modal.getInstance(document.getElementById('donateModal'));
                donateModal.hide();
            }

            // alert("You are a premium user now");

            // handlePremiumButton(true);  //updating the dashboard to show the premium message
        }
    };

    const rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', async function (response) {
        console.log(response);
        if (response.error) {
            alert("Something went wrong");
            //hide sign-up modal
            const donateModal = bootstrap.Modal.getInstance(document.getElementById('donateModal'));
            donateModal.hide();

            await axios.post('donor/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: "payment_failed",
            }, { headers: { 'Authorization': token } });

        }
    });

    rzp1.open();
});

