/************************************************************
 * 1) MAP NUMERIC GRADE TO LETTER GRADE
 ************************************************************/
function getLetterGrade(num) {
  if (num >= 98) return "A+";
  if (num >= 93) return "A";
  if (num >= 90) return "A-";
  if (num >= 87) return "B+";
  if (num >= 83) return "B";
  if (num >= 80) return "B-";
  if (num >= 77) return "C+";
  if (num >= 73) return "C";
  if (num >= 70) return "C-";
  return "F"; // Below 70
}

/************************************************************
 * 2) LOOKUP TABLE
 ************************************************************/
const pointsTable = {
  "A+": { AP: 5.33, Honors: 4.83, CP: 4.33 },
  "A":  { AP: 5.00, Honors: 4.50, CP: 4.00 },
  "A-": { AP: 4.67, Honors: 4.17, CP: 3.67 },
  "B+": { AP: 4.33, Honors: 3.83, CP: 3.33 },
  "B":  { AP: 4.00, Honors: 3.50, CP: 3.00 },
  "B-": { AP: 3.67, Honors: 3.17, CP: 2.67 },
  "C+": { AP: 3.33, Honors: 2.83, CP: 2.33 },
  "C":  { AP: 3.00, Honors: 2.50, CP: 2.00 },
  "C-": { AP: 2.67, Honors: 2.17, CP: 1.67 },
  "F":  { AP: 0.00, Honors: 0.00, CP: 0.00 },
};

/************************************************************
 * 3) CALCULATE GPA
 ************************************************************/
let gpaCalculated = false;

function calculateGPA() {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.innerText = "";

  const rows = document.querySelectorAll("#course-table-body tr");

  let totalPoints = 0;
  let validCourses = 0;

  let missingNumeric = false;
  let missingLevel = false;

  rows.forEach((row) => {
    const numericInput = row.querySelector(".numeric-grade");
    const levelSelect = row.querySelector(".course-level");

    const numericVal = parseFloat(numericInput.value);
    if (isNaN(numericVal)) {
      missingNumeric = true;
      return;
    }
    if (levelSelect.value === "choose") {
      missingLevel = true;
      return;
    }

    const letterGrade = getLetterGrade(numericVal);
    const weightedVal = pointsTable[letterGrade][levelSelect.value];
    totalPoints += weightedVal;
    validCourses++;
  });

  let errors = [];
  if (missingNumeric) {
    errors.push(
      "One or more selected courses are missing a numeric grade input, input a grade or remove the course."
    );
  }
  if (missingLevel) {
    errors.push(
      "One or more of the inputted courses are missing an attached course level, select a course level."
    );
  }

  if (errors.length > 0) {
    errorMessageElement.innerText = errors.join(" ");
    gpaCalculated = false;
    disableReportCardButton();
    return;
  }

  let gpa = 0;
  if (validCourses > 0) {
    gpa = totalPoints / validCourses;
    gpaCalculated = true;
  } else {
    gpaCalculated = false;
  }
  document.getElementById("gpa-result").textContent = gpa.toFixed(2);

  if (gpaCalculated) {
    enableReportCardButton();
  } else {
    disableReportCardButton();
  }
}

/************************************************************
 * 4) ENABLE / DISABLE REPORT CARD BUTTON
 ************************************************************/
const generateReportBtn = document.getElementById("generate-report-btn");

function enableReportCardButton() {
  generateReportBtn.disabled = false;
  // Remove leftover tooltip
  generateReportBtn.removeAttribute("data-tooltip");
  generateReportBtn.removeAttribute("title");
}

function disableReportCardButton() {
  generateReportBtn.disabled = true;
  generateReportBtn.setAttribute(
    "title",
    generateReportBtn.getAttribute("data-tooltip") || ""
  );
}

/************************************************************
 * 5) ADD COURSE ROW
 ************************************************************/
function addCourseRow() {
  const tbody = document.getElementById("course-table-body");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
    <td>
      <input type="text" class="course-name" placeholder="Enter Course Name" />
    </td>
    <td>
      <input type="number" class="numeric-grade" min="0" max="100" />
    </td>
    <td>
      <select class="course-level">
        <option value="choose">Choose Level</option>
        <option value="AP">AP</option>
        <option value="Honors">Honors</option>
        <option value="CP">CP</option>
      </select>
    </td>
    <td><button class="remove-course-btn">Remove</button></td>
  `;
  tbody.appendChild(newRow);

  gpaCalculated = false;
  disableReportCardButton();
}

/************************************************************
 * 6) REMOVE COURSE
 ************************************************************/
function handleRemoveCourse(e) {
  if (e.target.classList.contains("remove-course-btn")) {
    e.target.closest("tr").remove();
    gpaCalculated = false;
    disableReportCardButton();
  }
}

/************************************************************
 * 7) NO-NAME CHECK
 ************************************************************/
const noNameModal = document.getElementById("no-name-modal");
const noNameText = document.getElementById("no-name-text");
const continueWithoutNamesBtn = document.getElementById("continue-without-names-btn");
const returnToNamesBtn = document.getElementById("return-to-names-btn");

function handleGenerateReport() {
  if (!gpaCalculated) return;

  // Collect data
  const { coursesData, finalGPA } = collectCourseData();

  // Check for unnamed courses
  let unnamedCount = 0;
  coursesData.forEach((c) => {
    if (!c.name) unnamedCount++;
  });

  if (unnamedCount > 0) {
    noNameText.textContent = `You have not entered course names for ${unnamedCount} course(s).`;
    noNameModal.style.display = "block";
  } else {
    storeAndRedirect(coursesData, finalGPA);
  }
}

function handleContinueWithoutNames() {
  const { coursesData, finalGPA } = collectCourseData();
  let untitledIndex = 1;
  coursesData.forEach((c) => {
    if (!c.name) {
      c.name = `Untitled Course #${untitledIndex++}`;
    }
  });
  storeAndRedirect(coursesData, finalGPA);
}

function handleReturnToNames() {
  noNameModal.style.display = "none";
}

// Gather final data
function collectCourseData() {
  const rows = document.querySelectorAll("#course-table-body tr");
  let totalPoints = 0;
  let validCourses = 0;

  const coursesData = [];
  rows.forEach((row) => {
    const nameInput = row.querySelector(".course-name");
    const numericInput = row.querySelector(".numeric-grade");
    const levelSelect = row.querySelector(".course-level");

    const nameVal = nameInput.value.trim();
    const numericVal = parseFloat(numericInput.value);
    const levelVal = levelSelect.value;

    let letterGrade = "";
    let weight = 0;
    if (!isNaN(numericVal) && levelVal !== "choose") {
      letterGrade = getLetterGrade(numericVal);
      weight = pointsTable[letterGrade][levelVal] || 0;
      totalPoints += weight;
      validCourses++;
    }
    coursesData.push({
      name: nameVal,
      numeric: isNaN(numericVal) ? "" : numericVal,
      letter: letterGrade,
      weight
    });
  });

  let finalGPA = 0;
  if (validCourses > 0) {
    finalGPA = totalPoints / validCourses;
  }
  return { coursesData, finalGPA };
}

// Save to localStorage
function storeAndRedirect(coursesData, finalGPA) {
  const dataObj = { courses: coursesData, finalGPA };
  localStorage.setItem("mohsReportData", JSON.stringify(dataObj));
  noNameModal.style.display = "none";
  window.location.href = "report-card.html";
}

/************************************************************
 * 8) SETTINGS & THEMES
 ************************************************************/
const settingsModal = document.getElementById("settings-modal");
const settingsBtn = document.getElementById("settings-btn");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const mohsThemeToggle = document.getElementById("mohs-theme-toggle");

// Show/hide Settings modal
settingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "block";
});
closeSettingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = "none";
  }
});

// Dark Mode
darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});

// MOHS Theme
mohsThemeToggle.addEventListener("change", () => {
  if (mohsThemeToggle.checked) {
    document.body.classList.add("mohs-theme");
  } else {
    document.body.classList.remove("mohs-theme");
  }
});

/************************************************************
 * 9) INIT
 ************************************************************/
document.getElementById("calculate-btn").addEventListener("click", calculateGPA);
document.getElementById("add-course-btn").addEventListener("click", addCourseRow);
document.addEventListener("click", handleRemoveCourse);
document
  .getElementById("generate-report-btn")
  .addEventListener("click", handleGenerateReport);
continueWithoutNamesBtn.addEventListener("click", handleContinueWithoutNames);
returnToNamesBtn.addEventListener("click", handleReturnToNames);

// Initially disable the button
disableReportCardButton();
