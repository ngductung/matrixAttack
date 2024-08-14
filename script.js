let currentTechnique = null;
let currentStep = null;

function loadDataFromJson(jsonData) {
  const tableHead = document.querySelector("table thead");
  const tableBody = document.querySelector("table tbody");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headerRow = document.createElement("tr");
  jsonData.steps.forEach((step) => {
    const th = document.createElement("th");
    th.textContent = step.name;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  const bodyRow = document.createElement("tr");
  jsonData.steps.forEach((step) => {
    const td = document.createElement("td");
    td.className = "selected-techniques";
    td.dataset.step = step.name;
    bodyRow.appendChild(td);
  });
  tableBody.appendChild(bodyRow);

  jsonData.steps.forEach((step, stepIndex) => {
    const th = tableHead.querySelector(`th:nth-child(${stepIndex + 1})`);
    const dropdownContent = document.createElement("div");
    dropdownContent.className = "dropdown-content";

    step.techniques.forEach((technique) => {
      const techniqueLink = document.createElement("a");
      techniqueLink.className="sub-dropdown-content";
      techniqueLink.href = "#";
      techniqueLink.textContent = technique.name;

      if (technique.subtechniques.length > 0) {
        const icon = document.createElement("span");
        icon.textContent = "🔽";
        icon.style.marginLeft = "5px";
        techniqueLink.appendChild(icon);
      }

      const subtechniquesDropdown = document.createElement("div");
      subtechniquesDropdown.className = "subtechniques-dropdown";
      techniqueLink.onclick = function (e) {
        e.preventDefault();
        addTechniqueToTable(technique.name, step.name);
      };
      techniqueLink.appendChild(subtechniquesDropdown);
      technique.subtechniques.forEach((subtechnique) => {
        const subtechniqueLink = document.createElement("a");
        subtechniqueLink.href = "#";
        subtechniqueLink.textContent = subtechnique;
        subtechniqueLink.onclick = function (e) {
          e.stopPropagation();
          addTechniqueToTable(subtechnique, step.name);
        };
        subtechniquesDropdown.appendChild(subtechniqueLink);
      });

      dropdownContent.appendChild(techniqueLink);
    });

    th.appendChild(dropdownContent);
  });

  loadStoredTechniques();
}

function addTechniqueToTable(technique, step) {
  const selectedTechniquesDiv = document.querySelector(
    `.selected-techniques[data-step="${step}"]`
  );

  if (
    Array.from(selectedTechniquesDiv.children).some(
      (child) =>
        child.querySelector(".technique-name").textContent === technique
    )
  ) {
    return;
  }

  const techniqueElement = document.createElement("div");
  techniqueElement.className = "selected-technique";
  techniqueElement.innerHTML = `
    <span class="technique-name">${technique}</span>
    <button class="remove-btn" onclick="removeTechnique(event)">X</button>
  `;
  techniqueElement.onclick = function (e) {
    if (!e.target.matches(".remove-btn")) {
      selectTechnique(technique, step);
    }
  };

  selectedTechniquesDiv.appendChild(techniqueElement);
}

function selectTechnique(technique, step) {
  if (currentTechnique === technique && currentStep === step) return;

  currentTechnique = technique;
  currentStep = step;

  const selectedTechniquesDiv = document.querySelector(
    `.selected-techniques[data-step="${step}"]`
  );
  const existingTechniqueDiv = Array.from(selectedTechniquesDiv.children).find(
    (child) => child.querySelector(".technique-name").textContent === technique
  );

  selectedTechniquesDiv
    .querySelectorAll(".selected-technique")
    .forEach((el) => {
      el.style.backgroundColor = "";
    });
  if (existingTechniqueDiv) {
    existingTechniqueDiv.style.backgroundColor = "pink";
  }

  const noteArea = document.getElementById("noteArea");
  noteArea.style.display = "block";
  noteArea.disabled = false;

  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  const storedNote = storedData[step]?.[technique]?.note || "";
  noteArea.value = storedNote;
}

function saveNote() {
  if (currentTechnique && currentStep) {
    const noteArea = document.getElementById("noteArea");
    const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
    storedData[currentStep] = storedData[currentStep] || {};
    storedData[currentStep][currentTechnique] = {
      note: noteArea.value,
    };
    localStorage.setItem("techniqueData", JSON.stringify(storedData));

    const selectedTechniquesDiv = document.querySelector(
      `.selected-techniques[data-step="${currentStep}"]`
    );
    selectedTechniquesDiv
      .querySelectorAll(".selected-technique")
      .forEach((el) => {
        el.style.backgroundColor = "";
      });
    noteArea.style.display = "none";
    noteArea.value = "";
    noteArea.disabled = true;
    currentTechnique = null;
    currentStep = null;
  }
}

function removeTechnique(event) {
  event.stopPropagation();
  const button = event.target;
  const techniqueElement = button.parentElement;
  const selectedTechniquesDiv = techniqueElement.parentElement;
  const techniqueName =
    techniqueElement.querySelector(".technique-name").textContent;
  const step = selectedTechniquesDiv.dataset.step;

  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  if (storedData[step]?.[techniqueName]) {
    delete storedData[step][techniqueName];
    if (Object.keys(storedData[step]).length === 0) {
      delete storedData[step];
    }
    localStorage.setItem("techniqueData", JSON.stringify(storedData));
  }

  selectedTechniquesDiv.removeChild(techniqueElement);

  if (selectedTechniquesDiv.children.length === 0) {
    document.getElementById("noteArea").style.display = "none";
    document.getElementById("noteArea").value = "";
    document.getElementById("noteArea").disabled = true;
  }
}

function exportData() {
  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  const jsonData = JSON.stringify(storedData, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "techniqueData.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.setItem("techniqueData", JSON.stringify(data));
      location.reload();
    } catch (error) {
      console.error("Error parsing JSON file:", error);
    }
  };
  reader.readAsText(file);
}

function loadStoredTechniques() {
  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  Object.keys(storedData).forEach((step) => {
    Object.keys(storedData[step]).forEach((technique) => {
      addTechniqueToTable(technique, step);
    });
  });
}

function toggleDarkMode() {
  const body = document.body;
  const isDarkMode = body.classList.toggle("dark-mode");

  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

document.addEventListener("DOMContentLoaded", () => {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
  }

  const toggleButton = document.getElementById("modeToggle");
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleDarkMode);
  }

  fetch("data.json")
    .then((response) => response.json())
    .then((jsonData) => {
      loadDataFromJson(jsonData);
    })
    .catch((error) => console.error("Error loading data:", error));
});

document.getElementById("noteArea").addEventListener("focusout", saveNote);
