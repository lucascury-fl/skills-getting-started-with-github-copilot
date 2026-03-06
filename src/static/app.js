document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and existing dropdown options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build card header safely
        const heading = document.createElement("h4");
        heading.textContent = name;

        const descPara = document.createElement("p");
        descPara.textContent = details.description;

        const schedulePara = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule: ";
        schedulePara.appendChild(scheduleStrong);
        schedulePara.appendChild(document.createTextNode(details.schedule));

        const availPara = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability: ";
        availPara.appendChild(availStrong);
        availPara.appendChild(document.createTextNode(`${spotsLeft} spots left`));

        // Build participants section safely
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsSection.appendChild(participantsHeading);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants.length > 0) {
          details.participants.forEach(p => {
            const li = document.createElement("li");

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = p;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant";
            deleteBtn.title = "Unregister";
            deleteBtn.textContent = "✕";
            deleteBtn.dataset.activity = name;
            deleteBtn.dataset.email = p;

            li.appendChild(emailSpan);
            li.appendChild(deleteBtn);
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "no-participants";
          const em = document.createElement("em");
          em.textContent = "No participants yet";
          li.appendChild(em);
          participantsList.appendChild(li);
        }

        participantsSection.appendChild(participantsList);

        activityCard.appendChild(heading);
        activityCard.appendChild(descPara);
        activityCard.appendChild(schedulePara);
        activityCard.appendChild(availPara);
        activityCard.appendChild(participantsSection);

        // Add event listeners for delete buttons
        const deleteButtons = activityCard.querySelectorAll('.delete-participant');
        deleteButtons.forEach(button => {
          button.addEventListener('click', async (event) => {
            event.preventDefault();
            const activityName = button.getAttribute('data-activity');
            const email = button.getAttribute('data-email');

            if (confirm(`Are you sure you want to unregister ${email} from ${activityName}?`)) {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
                  { method: 'DELETE' }
                );

                if (response.ok) {
                  fetchActivities(); // Refresh the activities list
                } else {
                  const result = await response.json();
                  alert('Error: ' + (result.detail || 'Failed to unregister'));
                }
              } catch (error) {
                alert('Failed to unregister. Please try again.');
                console.error('Error unregistering:', error);
              }
            }
          });
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities to show the new participant
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
