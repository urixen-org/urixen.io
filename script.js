const orgName = "urixen-org";
const ul = document.querySelector("#products ul");

// Predefined colors for tags
const colors = [
  "blue",
  "red",
  "green",
  "orange",
  "purple",
  "teal",
  "cyan",
  "gray",
];

async function fetchRepos() {
  try {
    const response = await fetch(
      `https://api.github.com/orgs/${orgName}/repos?per_page=10`
    );
    if (!response.ok) throw new Error("Failed to fetch repos");
    let repos = await response.json();

    // Exclude .github and opendata repos
    repos = repos.filter(
      (repo) => repo.name !== ".github" && repo.name !== "opendata"
    );

    // Pick first 3 and 8th (if exists)
    const selected = repos.slice(0, 4);
    if (repos[7]) selected.push(repos[7]);

    // Fetch topics for each selected repo
    for (const repo of selected) {
      const topicsRes = await fetch(
        `https://api.github.com/repos/${orgName}/${repo.name}/topics`,
        {
          headers: { Accept: "application/vnd.github.mercy-preview+json" },
        }
      );
      const topicsData = await topicsRes.json();
      // Exclude ignore-urixen-web and limit to 3–4 topics
      repo.topics = (topicsData.names || [])
        .filter((t) => t !== "ignore-urixen-web")
        .slice(0, 5);
    }

    // Render
    selected.forEach((repo) => {
      const li = document.createElement("li");

      // Map topics to colored spans
      const tagsHTML = repo.topics
        .map((topic, idx) => {
          const color = colors[idx % colors.length];
          return `<span class="tag ${color}">${topic}</span>`;
        })
        .join(" ");

      li.innerHTML = `
        <div class="card">
          <img src="https://opengraph.githubassets.com/1/${
            repo.full_name
          }" alt="${repo.name}" />
          <h3>${repo.name}</h3>
          <div class="tags">${tagsHTML}</div>
          <p>${repo.description || "No description"}</p>
          <a href="${repo.html_url}" target="_blank">Open</a>
        </div>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    ul.innerHTML = "<li>Failed to load repositories.</li>";
  }
}

fetchRepos();
