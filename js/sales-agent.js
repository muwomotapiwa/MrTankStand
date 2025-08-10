// AI Sales Agent for Mr Tank Stand

// 1. Initialize the agent's memory
const salesAgent = {
  leadScore: 0,
  hotLeadThreshold: 25, // We'll say 25 points makes a "hot lead"
  notified: false, // To prevent sending multiple alerts
  userActions: [], // To keep track of what the user did
  guidanceTimeout: null // To manage the guidance popup timeout
};

// This is the URL from your Google Apps Script. We will fill this in later.
const NOTIFICATION_URL = 'https://script.google.com/macros/s/AKfycbygHUyd3y-e-N9ntk4779_3dOuAGdLp1kKn3B_CYBASxM1QJZ_zEV4MginvqDxDsA4K/exec'; 

// 2. Create a function to update the score
function updateLeadScore(points, actionDescription) {
  if (salesAgent.notified) return; // Stop tracking after sending an alert

  // Prevent adding points for the same action repeatedly
  if (salesAgent.userActions.includes(actionDescription)) {
    return;
  }

  salesAgent.leadScore += points;
  salesAgent.userActions.push(actionDescription);
  console.log(`Action: ${actionDescription} (+${points} pts). New Score: ${salesAgent.leadScore}`); // For testing

  // Check if the user has become a hot lead
  checkIfHotLead();
}

// 3. Function to show guidance messages
function showGuidance(message) {
  const popup = document.getElementById('agent-guidance');
  if (!popup) return;

  // Clear any existing timeout
  if (salesAgent.guidanceTimeout) {
    clearTimeout(salesAgent.guidanceTimeout);
  }

  popup.textContent = message;
  popup.classList.add('show');

  // Hide the message after 7 seconds
  salesAgent.guidanceTimeout = setTimeout(() => {
    popup.classList.remove('show');
  }, 7000);
}

// 4. The "Hot Lead" logic
function checkIfHotLead() {
  if (salesAgent.leadScore >= salesAgent.hotLeadThreshold && !salesAgent.notified) {
    // Mark as notified to prevent duplicate alerts
    salesAgent.notified = true; 
    
    console.log("HOT LEAD DETECTED! Sending alert...");
    showGuidance("It looks like you've found a great solution! If you contact us, we can prioritize your quote.");

    // Prepare the alert data
    const alertData = {
      type: 'hot_lead_alert', // We use a 'type' to differentiate it from a normal lead
      score: salesAgent.leadScore,
      actions: salesAgent.userActions.join(', '),
      timestamp: new Date().toISOString()
    };

    // Send the notification to your Google Apps Script
    if (NOTIFICATION_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        fetch(NOTIFICATION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(alertData)
        }).catch(err => console.error("Failed to send hot lead alert:", err));
    } else {
        console.error("NOTIFICATION_URL is not set. Cannot send hot lead alert.");
    }
  }
}


// 5. Hook into your existing elements to track clicks
document.addEventListener('DOMContentLoaded', function() {
  // Example: User interacts with the price estimator
  const estimateForm = document.getElementById('estimateForm');
  if (estimateForm) {
    estimateForm.addEventListener('change', () => updateLeadScore(10, 'Used the Price Estimator'));
  }

  // Example: User interacts with the sizing wizard
  const sizingForm = document.getElementById('sizingForm');
  if (sizingForm) {
    sizingForm.addEventListener('change', () => {
        updateLeadScore(10, 'Used the Sizing Wizard');
        showGuidance('Good choice! Now that you know your tank size, use our estimator below to get a full price.');
    });
  }
  
  // Example: User clicks on a specific package
  const packageButtons = document.querySelectorAll('.pkg-btn');
  packageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const packageName = btn.dataset.package || 'Unknown Package';
        updateLeadScore(15, `Clicked on package: ${packageName}`);
        showGuidance(`The "${packageName}" is a great deal! We've pre-filled the contact form for you.`);
    });
  });
  
  // Example: User scrolls down to the contact form
  const contactSection = document.getElementById('contact');
  if(contactSection) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateLeadScore(5, 'Viewed the Contact Form');
          observer.disconnect(); // Stop observing after it's seen once
        }
      }, { threshold: 0.5 }); // Trigger when 50% of the element is visible
      observer.observe(contactSection);
  }
});
