document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Escape text to avoid HTML injection
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participantsArr = Array.isArray(details.participants) ? details.participants : [];
        const maxP = typeof details.max_participants === 'number' ? details.max_participants : (Number(details.max_participants) || 0);
        const spotsLeft = Math.max(0, maxP - participantsArr.length);

        const maxShow = 3;
        const visible = participantsArr.slice(0, maxShow);
        const remaining = participantsArr.length - visible.length;

        const participantsHtml = visible.length
          ? `<ul class="participants-list">${visible.map(p => {
              const text = escapeHtml(typeof p === 'string' ? p : (p.email || p.name || JSON.stringify(p)));
              const attr = escapeHtml(typeof p === 'string' ? p : (p.email || p.name || JSON.stringify(p)));
              return `<li><span class="participant-text">${text}</span><button class="participant-remove" data-email="${attr}" title="Remove participant">✖</button></li>`;
            }).join('')}${remaining > 0 ? `<li class="more">and ${remaining} more</li>` : ''}</ul>`
          : `<p class="participants-empty">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${escapeHtml(name)}</h4>
          <p>${escapeHtml(details.description)}</p>
          <p><strong>Schedule:</strong> ${escapeHtml(details.schedule)}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHtml}
        `;

        // Handle clicks inside the card (toggle "more" and remove participant)
        activityCard.addEventListener('click', async (e) => {
          // Remove participant
          if (e.target.classList && e.target.classList.contains('participant-remove')) {
            e.stopPropagation();
            const email = e.target.getAttribute('data-email');
            if (!email) return;

            try {
              const resp = await fetch(`/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(email)}`, {
                method: 'DELETE',
              });

              if (resp.ok) {
                // Refresh activities list
                fetchActivities();
              } else {
                const err = await resp.json().catch(() => ({}));
                console.error('Failed to remove participant', err);
                messageDiv.textContent = err.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
                setTimeout(() => messageDiv.classList.add('hidden'), 3000);
              }
            } catch (err) {
              console.error('Error removing participant:', err);
            }
            return;
          }

          // Toggle expanded list when "more" is clicked
          if (e.target.classList && e.target.classList.contains('more')) {
            activityCard.classList.toggle('expanded');
            if (activityCard.classList.contains('expanded')) {
              e.target.textContent = 'show less';
            } else {
              e.target.textContent = `and ${remaining} more`;
            }
          }
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
        // Refresh activities so the new participant is shown immediately
        fetchActivities();
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
