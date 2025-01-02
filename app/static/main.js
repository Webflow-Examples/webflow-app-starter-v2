class WebflowExplorer {
  constructor() {
    // DOM Elements
    this.getSitesBtn = document.getElementById("getSitesBtn");
    this.sitesDisplay = document.getElementById("sitesData");
    this.jsonContainer = document.querySelector(".json-container");

    // Bind methods
    this.fetchSites = this.fetchSites.bind(this);
    this.displayJSON = this.displayJSON.bind(this);
    this.handleError = this.handleError.bind(this);

    // Initialize
    this.init();

    // Check URL params for auth status
    this.checkAuthStatus();
  }

  init() {
    // Add click handler regardless of auth state
    this.getSitesBtn.addEventListener("click", this.fetchSites);
    console.log("Added click handler to:", this.getSitesBtn);
  }

  async fetchSites() {
    console.log("Fetching sites...");
    this.setLoading(true);

    try {
      const response = await fetch("/sites", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const sites = await response.json();
      console.log("Sites received:", sites);
      this.displayJSON(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      this.handleError(error);
    } finally {
      this.setLoading(false);
    }
  }

  displayJSON(data) {
    // Format the JSON with indentation
    const formattedJson = JSON.stringify(data, null, 2);

    // Update the display
    this.sitesDisplay.innerHTML = `<code class="language-json">${formattedJson}</code>`;

    // Show the container
    this.jsonContainer.style.display = "block";

    // Apply syntax highlighting
    hljs.highlightElement(this.sitesDisplay.querySelector("code"));
  }

  handleError(error) {
    // Display error in JSON format
    const errorData = {
      error: true,
      message: error.message || "An error occurred while fetching sites",
      timestamp: new Date().toISOString(),
    };

    this.displayJSON(errorData);
  }

  setLoading(isLoading) {
    // Update button state and text
    this.getSitesBtn.disabled = isLoading;
    this.getSitesBtn.textContent = isLoading ? "Loading..." : "Fetch Sites";
  }

  checkAuthStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAuthorized = urlParams.get("authorized") === "true";

    if (isAuthorized) {
      document.body.classList.remove("unauthorized");
      document.body.classList.add("authorized");

      // Clean up URL
      window.history.replaceState({}, document.title, "/");
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new WebflowExplorer();
});
