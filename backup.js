let currentTechnique = null;
let currentStep = null;

// Hàm để tải dữ liệu từ file JSON và cập nhật bảng
function loadDataFromJson(jsonData) {
  const tableHead = document.querySelector("table thead");
  const tableBody = document.querySelector("table tbody");

  // Xóa nội dung hiện tại
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  // Tạo header cho bảng
  const headerRow = document.createElement("tr");
  jsonData.steps.forEach((step) => {
    const th = document.createElement("th");
    th.textContent = step.name;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // Tạo nội dung cho bảng
  const bodyRow = document.createElement("tr");
  jsonData.steps.forEach((step) => {
    const td = document.createElement("td");
    td.className = "selected-techniques";
    td.dataset.step = step.name;
    bodyRow.appendChild(td);
  });
  tableBody.appendChild(bodyRow);

  // Tạo dropdown cho từng kỹ thuật
  jsonData.steps.forEach((step, stepIndex) => {
    const th = tableHead.querySelector(`th:nth-child(${stepIndex + 1})`);
    const dropdownContent = document.createElement("div");
    dropdownContent.className = "dropdown-content";

    step.techniques.forEach((technique) => {
      const techniqueLink = document.createElement("a");
      techniqueLink.href = "#";
      techniqueLink.textContent = technique.name;

      // Kiểm tra nếu có subtechniques và thêm icon
      if (technique.subtechniques.length > 0) {
        const icon = document.createElement("span");
        icon.textContent = "🔽"; // Biểu tượng cho subtechniques
        icon.style.marginLeft = "5px"; // Khoảng cách giữa tên kỹ thuật và biểu tượng
        techniqueLink.appendChild(icon);
      }

      // Thêm các subtechniques vào dropdown khi hover
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

  // Hiển thị các kỹ thuật đã lưu từ localStorage
  loadStoredTechniques();
}

// Hàm thêm kỹ thuật vào bảng
function addTechniqueToTable(technique, step) {
  const selectedTechniquesDiv = document.querySelector(
    `.selected-techniques[data-step="${step}"]`
  );

  // Kiểm tra xem kỹ thuật đã được thêm chưa
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
    // Ngăn không gọi selectTechnique khi nhấn nút xóa
    if (!e.target.matches(".remove-btn")) {
      selectTechnique(technique, step);
    }
  };

  selectedTechniquesDiv.appendChild(techniqueElement);
}

// Hàm chọn kỹ thuật và hiển thị ghi chú
function selectTechnique(technique, step) {
  // Đảm bảo rằng sự kiện không bị gọi khi kỹ thuật đã bị xóa
  if (currentTechnique === technique && currentStep === step) return;

  currentTechnique = technique;
  currentStep = step;

  const selectedTechniquesDiv = document.querySelector(
    `.selected-techniques[data-step="${step}"]`
  );
  const existingTechniqueDiv = Array.from(selectedTechniquesDiv.children).find(
    (child) => child.querySelector(".technique-name").textContent === technique
  );

  // Đổi màu nền của kỹ thuật đang được chọn
  selectedTechniquesDiv
    .querySelectorAll(".selected-technique")
    .forEach((el) => {
      el.style.backgroundColor = "";
    });
  if (existingTechniqueDiv) {
    existingTechniqueDiv.style.backgroundColor = "pink";
  }

  // Hiển thị textarea và tải ghi chú
  const noteArea = document.getElementById("noteArea");
  noteArea.style.display = "block";
  noteArea.disabled = false;

  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  const storedNote = storedData[step]?.[technique]?.note || "";
  noteArea.value = storedNote;
}

// Hàm lưu ghi chú vào localStorage
function saveNote() {
  if (currentTechnique && currentStep) {
    const noteArea = document.getElementById("noteArea");
    const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
    storedData[currentStep] = storedData[currentStep] || {};
    storedData[currentStep][currentTechnique] = {
      note: noteArea.value,
    };
    localStorage.setItem("techniqueData", JSON.stringify(storedData));

    // Ẩn textarea và trả lại màu nền của kỹ thuật
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

// Hàm xóa kỹ thuật
function removeTechnique(event) {
  event.stopPropagation(); // Ngăn không gọi sự kiện chọn kỹ thuật
  const button = event.target;
  const techniqueElement = button.parentElement;
  const selectedTechniquesDiv = techniqueElement.parentElement;
  const techniqueName =
    techniqueElement.querySelector(".technique-name").textContent;
  const step = selectedTechniquesDiv.dataset.step;

  // Xóa khỏi localStorage khi xóa kỹ thuật
  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  if (storedData[step]?.[techniqueName]) {
    delete storedData[step][techniqueName];
    if (Object.keys(storedData[step]).length === 0) {
      delete storedData[step];
    }
    localStorage.setItem("techniqueData", JSON.stringify(storedData));
  }

  // Xóa kỹ thuật khỏi bảng
  selectedTechniquesDiv.removeChild(techniqueElement);

  // Ẩn textarea nếu không còn kỹ thuật nào được chọn
  if (selectedTechniquesDiv.children.length === 0) {
    document.getElementById("noteArea").style.display = "none";
    document.getElementById("noteArea").value = "";
    document.getElementById("noteArea").disabled = true;
  }
}

// Hàm xuất dữ liệu ra file JSON
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

// Hàm import dữ liệu từ file JSON
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.setItem("techniqueData", JSON.stringify(data));
      location.reload(); // Reload trang để cập nhật giao diện với dữ liệu mới
    } catch (error) {
      console.error("Error parsing JSON file:", error);
    }
  };
  reader.readAsText(file);
}

// Hàm tải các kỹ thuật đã lưu từ localStorage
function loadStoredTechniques() {
  const storedData = JSON.parse(localStorage.getItem("techniqueData")) || {};
  Object.keys(storedData).forEach((step) => {
    Object.keys(storedData[step]).forEach((technique) => {
      addTechniqueToTable(technique, step);
    });
  });
}

// Hàm chuyển đổi chế độ tối
function toggleDarkMode() {
  const body = document.body;
  const isDarkMode = body.classList.toggle("dark-mode");

  // Lưu trạng thái Dark Mode vào localStorage
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", () => {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
  }

  const toggleButton = document.getElementById("modeToggle");
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleDarkMode);
  }

  // Tải dữ liệu từ data.json và hiển thị lên bảng
  fetch("data.json")
    .then((response) => response.json())
    .then((jsonData) => {
      loadDataFromJson(jsonData);
    })
    .catch((error) => console.error("Error loading data:", error));
});

document.getElementById("noteArea").addEventListener("focusout", saveNote);
