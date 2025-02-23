/************************************************************
 * reportCard.js
 * For the "Report Card" page
 ************************************************************/

const reportCardBody = document.getElementById("report-card-body");
const finalGpaEl = document.getElementById("final-gpa");
const printBtn = document.getElementById("print-btn");
const calcBreakdownEl = document.getElementById("calc-breakdown");
const generationDateEl = document.getElementById("generation-date");

// Return to Calculator (no-print)
const returnCalculatorBtn = document.getElementById("return-calculator-btn");
returnCalculatorBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Generate "Month Day, Year" date
const options = { year: "numeric", month: "long", day: "numeric" };
const currentDateString = new Date().toLocaleDateString("en-US", options);
generationDateEl.textContent = `Date Generated: ${currentDateString}`;

// Load data from localStorage
const storedData = localStorage.getItem("mohsReportData");
if (!storedData) {
  reportCardBody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center; color:red;">
        No course data found. Please return to the main page.
      </td>
    </tr>
  `;
} else {
  const reportData = JSON.parse(storedData);
  const { courses, finalGPA } = reportData;

  let totalPoints = 0;
  let validCourses = 0;

  // Populate the table
  courses.forEach((course) => {
    const row = document.createElement("tr");
    const nameDisplay = course.name || "";
    const letterDisplay = course.letter || "";
    const numericDisplay = course.numeric === "" ? "" : course.numeric;
    const weightDisplay = course.weight || 0;

    if (weightDisplay > 0) {
      totalPoints += weightDisplay;
      validCourses++;
    }

    row.innerHTML = `
      <td>${nameDisplay}</td>
      <td>${letterDisplay}</td>
      <td>${numericDisplay}</td>
      <td>${weightDisplay.toFixed(2)}</td>
    `;
    reportCardBody.appendChild(row);
  });

  // Show final GPA
  finalGpaEl.textContent = `Final Weighted GPA: ${finalGPA.toFixed(2)}`;

  // Simple breakdown
  calcBreakdownEl.innerHTML = `
    <h3>Your Weighted GPA Calculation</h3>
    <p><strong>Number of Valid Courses:</strong> ${validCourses}</p>
    <p><strong>Sum of Weighted Points:</strong> ${totalPoints.toFixed(2)}</p>
    <p><strong>Final GPA:</strong> ${finalGPA.toFixed(2)}</p>
  `;
}

// Print or Save PDF
printBtn.addEventListener("click", () => {
  window.print();
});
