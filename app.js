/**
 * Unified Tribal Scholarship Portal - SPA Engine & State Manager
 * Problem Statement: SIH26238 | Ministry of Tribal Affairs
 */

const SCHOLARSHIPS_DATA = [
  {
    id: "s1",
    title: "National Fellowship for Higher Education of ST Students",
    ministry: "Ministry of Tribal Affairs",
    amount: "₹31,000 / month + Contingency",
    deadline: "30 Nov 2026",
    maxIncome: 600000,
    requiredLevel: "Postgraduate / M.Phil / Ph.D",
    minMarks: 55,
    documents: ["Caste Certificate", "Income Affidavit", "PG Admission Proof"]
  },
  {
    id: "s2",
    title: "Pre-Matric Scholarship for ST Students (Class IX & X)",
    ministry: "Ministry of Tribal Affairs",
    amount: "₹4,000 / annum + Book Grant",
    deadline: "25 Oct 2026",
    maxIncome: 250000,
    requiredLevel: "Secondary (Class 9-10)",
    minMarks: 50,
    documents: ["Tribal Certificate", "Parent Income Certificate", "School ID"]
  },
  {
    id: "s3",
    title: "Post-Matric Scholarship for ST Students",
    ministry: "Ministry of Tribal Affairs",
    amount: "Full Tuition Fee + Maintenance Allowance",
    deadline: "15 Dec 2026",
    maxIncome: 250000,
    requiredLevel: "Undergraduate / Diploma",
    minMarks: 50,
    documents: ["Caste Certificate", "Income Certificate", "College Fee Receipt"]
  },
  {
    id: "s4",
    title: "National Overseas Scholarship for Scheduled Tribe Candidates",
    ministry: "Ministry of Tribal Affairs",
    amount: "Full Foreign Tuition + $15,400 Annual Allowance",
    deadline: "31 Jan 2027",
    maxIncome: 800000,
    requiredLevel: "Research",
    minMarks: 60,
    documents: ["Passport Copy", "Foreign University Offer", "ST Certificate"]
  }
];

// In-Memory Applications Store for Live Demo
let applicationsDB = [
  {
    appId: "APP-ST-101",
    studentName: "Zumainaah Ahmed",
    studentId: "ST_2026_88",
    schemeId: "s3",
    schemeTitle: "Post-Matric Scholarship for ST Students",
    date: "2026-09-12",
    amount: "₹ 48,000",
    status: "State Approved",
    stage: 3,
    documentsVerified: true
  }
];

// Document Vault Records
const uploadedDocsMap = new Map([
  ["s3-Caste Certificate", { fileName: "WB_ST_Cert_Zumainaah.pdf", fileUrl: "#" }],
  ["s3-Income Certificate", { fileName: "Income_Affidavit_2026.jpg", fileUrl: "#" }]
]);

// Auth State
let authState = {
  isLoggedIn: true,
  role: "student", // 'student' | 'officer' | null
  user: {
    name: "Zumainaah Ahmed",
    id: "9845-2311-8842",
    discipline: "BCA Undergraduate",
    institute: "Saroj Mohan Institute of Technology"
  }
};

let currentUploadTarget = null;
const hiddenFileInput = document.createElement("input");
hiddenFileInput.type = "file";
hiddenFileInput.style.display = "none";
hiddenFileInput.accept = ".pdf, .jpg, .jpeg, application/pdf, image/jpeg";
document.body.appendChild(hiddenFileInput);

// --- NAVIGATION & ROUTER ---
function navigateTo(viewId) {
  const views = document.querySelectorAll(".portal-view");
  views.forEach((v) => v.classList.remove("active"));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update Nav Active State
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("onclick") && link.getAttribute("onclick").includes(`'${viewId}'`)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  if (viewId === "apply") renderSchemes();
  if (viewId === "student-dashboard") renderStudentDashboard();
  if (viewId === "officer-dashboard") renderOfficerDashboard();
}

function filterAndNavigate(educationStage) {
  navigateTo("apply");
  const select = document.getElementById("select-education");
  if (select) {
    select.value = educationStage;
    renderSchemes();
  }
}

// --- LOGIN MODAL & AUTH SWITCHER ---
let loginRoleModalTarget = "student";

function openLoginModal(role) {
  if (authState.isLoggedIn && authState.role === role) {
    // If already logged in, navigate straight to dashboard
    navigateTo(role === "student" ? "student-dashboard" : "officer-dashboard");
    return;
  }

  loginRoleModalTarget = role;
  const modal = document.getElementById("login-modal");
  const heading = document.getElementById("modal-heading");
  const subtext = document.getElementById("modal-subtext");
  const lblId = document.getElementById("lbl-login-id");
  const inputId = document.getElementById("login-id");

  if (role === "student") {
    heading.textContent = "Student Single Sign-On (DigiLocker)";
    subtext.textContent = "National e-Pramaan Gateway for ST Beneficiaries";
    lblId.textContent = "Aadhaar / DigiLocker ID";
    inputId.value = "9845-2311-8842";
  } else {
    heading.textContent = "State Nodal / Institute Officer Desk";
    subtext.textContent = "Government Administrative Verification Portal";
    lblId.textContent = "Government AISHE / Employee ID";
    inputId.value = "OFFICER-WB-KOL-440";
  }

  modal.classList.remove("hidden");
}

function closeLoginModal() {
  document.getElementById("login-modal").classList.add("hidden");
}

function handleAuthSubmit(event) {
  event.preventDefault();
  authState.isLoggedIn = true;
  authState.role = loginRoleModalTarget;

  if (loginRoleModalTarget === "student") {
    authState.user.name = "Zumainaah Ahmed";
    authState.user.id = document.getElementById("login-id").value;
  } else {
    authState.user.name = "Dr. S. K. Mukherjee (Nodal Officer)";
    authState.user.id = document.getElementById("login-id").value;
  }

  closeLoginModal();
  updateAuthUI();
  navigateTo(loginRoleModalTarget === "student" ? "student-dashboard" : "officer-dashboard");
}

function logoutSession() {
  authState.isLoggedIn = false;
  authState.role = null;
  updateAuthUI();
  navigateTo("home");
}

function updateAuthUI() {
  const studentBtnText = document.getElementById("student-btn-text");
  const officerBtnText = document.getElementById("officer-btn-text");

  if (authState.isLoggedIn) {
    if (authState.role === "student") {
      studentBtnText.textContent = "Dashboard (Zumainaah)";
      officerBtnText.textContent = "Officer Portal";
    } else {
      studentBtnText.textContent = "Student Login";
      officerBtnText.textContent = "Officer Desk (Active)";
    }
  } else {
    studentBtnText.textContent = "Student Login";
    officerBtnText.textContent = "Officer Portal";
  }
}

// --- SCHOLARSHIPS DIRECTORY & DYNAMIC MATCHER ---
function renderSchemes() {
  const incomeInput = document.getElementById("input-income");
  const eduSelect = document.getElementById("select-education");
  const marksInput = document.getElementById("input-marks");
  const feed = document.getElementById("scholarships-feed");

  if (!feed) return;

  const income = Number(incomeInput.value) || 0;
  const education = eduSelect.value;
  const marks = Number(marksInput.value) || 0;

  feed.innerHTML = "";
  let matchedCount = 0;

  SCHOLARSHIPS_DATA.forEach((s) => {
    const isIncome = income <= s.maxIncome;
    const isEdu = education === s.requiredLevel;
    const isMarks = marks >= s.minMarks;
    const isEligible = isIncome && isEdu && isMarks;

    const existingApp = applicationsDB.find((a) => a.schemeId === s.id);

    if (isEligible) matchedCount++;

    const card = document.createElement("div");
    card.className = `scholarship-card ${!isEligible ? "ineligible" : ""}`;

    card.innerHTML = `
      <div class="card-top">
        <div>
          <span class="tag-ministry">${s.ministry}</span>
          <h3 class="scheme-name">${s.title}</h3>
          <p class="scheme-amount">${s.amount}</p>
        </div>
        <span class="eligibility-pill ${isEligible ? "pill-eligible" : "pill-ineligible"}">
          ${isEligible ? "Eligible" : "Criteria Not Met"}
        </span>
      </div>

      <div class="documents-section">
        <p class="docs-title">Required Documents (Upload PDF or JPG only):</p>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${s.documents
            .map((doc) => {
              const key = `${s.id}-${doc}`;
              const record = uploadedDocsMap.get(key);
              const isUploaded = !!record;

              return `
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; background:#f8fafc; padding:0.4rem 0.6rem; border-radius:6px; border:1px solid #e2e8f0;">
                  <span style="font-size:0.75rem; font-weight:600; color:#334155; min-width:140px;">${doc}:</span>${
                    isUploaded
                      ? `
                      <span style="font-size:0.75rem; background:#dcfce7; color:#15803d; padding:0.2rem 0.5rem; border-radius:4px; font-weight:600;">
                        <i class="fa-solid fa-circle-check"></i> ${record.fileName}
                      </span>
                      <a href="${record.fileUrl}" target="_blank" style="font-size:0.72rem; color:#0284c7; text-decoration:underline;">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> View
                      </a>
                      <button type="button" onclick="triggerUpload('${s.id}', '${doc}')" class="btn btn-sm btn-secondary">Modify</button>
                      <button type="button" onclick="removeDoc('${s.id}', '${doc}')" class="btn btn-sm btn-outline-danger">Remove</button>
                    `
                      : `
                      <button type="button" onclick="triggerUpload('${s.id}', '${doc}')" class="btn btn-sm btn-outline" style="color:#0f766e; border-color:#0f766e;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Document (PDF/JPG)
                      </button>
                    `
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="card-bottom">
        <span class="scheme-deadline">Deadline: ${s.deadline}</span>
        <button class="btn btn-primary" ${!isEligible || existingApp ? "disabled" : ""} onclick="applyToScheme('${s.id}')">
          ${existingApp ? "Application Submitted" : "One-Click Apply"}
        </button>
      </div>

      ${
        existingApp
          ? `
        <div class="tracker-box">
          <p class="tracker-heading">Application Tracking Pipeline (${existingApp.appId})</p>
          <div class="tracker-steps">
            <div class="tracker-step completed"><i class="fa-solid fa-circle-check"></i><span>Applied</span></div>
            <div class="tracker-step completed"><i class="fa-solid fa-circle-check"></i><span>DigiLocker Verified</span></div>
            <div class="tracker-step active"><i class="fa-solid fa-clock"></i><span>State Approved</span></div>
            <div class="tracker-step"><i class="fa-solid fa-circle-notch"></i><span>DBT Disbursed</span></div>
          </div>
        </div>
      `
          : ""
      }
    `;

    feed.appendChild(card);
  });

  document.getElementById("results-count").textContent = `${matchedCount} Matched of ${SCHOLARSHIPS_DATA.length} Programs`;
}

// --- FILE UPLOAD LIFECYCLE (STRICT PDF / JPG) ---
function triggerUpload(schemeId, docName) {
  currentUploadTarget = { schemeId, docName };
  hiddenFileInput.value = "";
  hiddenFileInput.click();
}

function removeDoc(schemeId, docName) {
  uploadedDocsMap.delete(`${schemeId}-${docName}`);
  renderSchemes();
}

hiddenFileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file || !currentUploadTarget) return;

  const validExts = ["pdf", "jpg", "jpeg"];
  const extension = file.name.split(".").pop().toLowerCase();

  if (!validExts.includes(extension)) {
    alert("❌ Invalid File Format!\n\nPlease upload documents in PDF or JPG format only.");
    return;
  }

  const { schemeId, docName } = currentUploadTarget;
  const key = `${schemeId}-${docName}`;

  // Form Data sent to Python Server
  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const res = await fetch("/api/v1/upload-document", { method: "POST", body: formData });
    const data = await res.json();
    uploadedDocsMap.set(key, { fileName: file.name, fileUrl: data.file_url || URL.createObjectURL(file) });
  } catch (err) {
    uploadedDocsMap.set(key, { fileName: file.name, fileUrl: URL.createObjectURL(file) });
  }

  renderSchemes();
});

function applyToScheme(schemeId) {
  if (!authState.isLoggedIn || authState.role !== "student") {
    alert("Please authenticate using your Student DigiLocker credentials first.");
    openLoginModal("student");
    return;
  }

  const targetScheme = SCHOLARSHIPS_DATA.find((s) => s.id === schemeId);
  const newAppId = `APP-ST-${applicationsDB.length + 101}`;

  applicationsDB.push({
    appId: newAppId,
    studentName: authState.user.name,
    studentId: authState.user.id,
    schemeId: schemeId,
    schemeTitle: targetScheme.title,
    date: new Date().toISOString().split("T")[0],
    amount: targetScheme.amount,
    status: "State Verification Pending",
    stage: 2,
    documentsVerified: true
  });

  alert(`✅ Application Submitted Successfully!\nApplication Reference ID: ${newAppId}`);
  renderSchemes();
}

// --- TRACK APPLICATION SEARCH ---
function executeTrackSearch() {
  const query = document.getElementById("track-input").value.trim();
  const resultsArea = document.getElementById("track-results-area");

  const record = applicationsDB.find((a) => a.appId.toLowerCase() === query.toLowerCase() || a.studentId === query);

  if (!record) {
    resultsArea.innerHTML = `<p style="color:#b91c1c; text-align:center;"><i class="fa-solid fa-triangle-exclamation"></i> No application found for reference "${query}". Please check and try again.</p>`;
    return;
  }

  resultsArea.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem; margin-bottom:1rem;">
      <div>
        <h3 style="font-size:1.1rem; color:#065f46;">${record.schemeTitle}</h3>
        <p style="font-size:0.78rem; color:#64748b;">Applicant: ${record.studentName} | ID: ${record.appId}</p>
      </div>
      <span class="badge-success">${record.status}</span>
    </div>
    <div class="tracker-steps" style="margin:1.5rem 0;">
      <div class="tracker-step completed"><i class="fa-solid fa-circle-check"></i><span>1. Submitted</span></div>
      <div class="tracker-step ${record.stage >= 2 ? "completed" : "active"}"><i class="fa-solid fa-circle-check"></i><span>2. DigiLocker Verified</span></div>
      <div class="tracker-step ${record.stage >= 3 ? "completed" : record.stage === 2 ? "active" : ""}"><i class="fa-solid fa-clock"></i><span>3. State Approved</span></div>
      <div class="tracker-step ${record.stage >= 4 ? "completed" : ""}"><i class="fa-solid fa-circle-notch"></i><span>4. DBT Disbursal</span></div>
    </div>
    <div style="background:#f8fafc; padding:0.75rem; border-radius:6px; font-size:0.78rem;">
      <p><strong>PFMS Bank Reference:</strong> Validated Aadhaar Seeding (Direct Benefit Transfer active)</p>
    </div>
  `;
}

// --- STUDENT DASHBOARD TAB SWITCHER ---
function switchDashTab(tabPaneId) {
  const panes = document.querySelectorAll(".dash-tab-pane");
  panes.forEach((p) => p.classList.remove("active"));

  const targetPane = document.getElementById(tabPaneId);
  if (targetPane) targetPane.classList.add("active");

  const tabBtns = document.querySelectorAll(".dash-tab-btn");
  tabBtns.forEach((btn) => {
    if (btn.getAttribute("onclick").includes(tabPaneId)) btn.classList.add("active");
    else btn.classList.remove("active");
  });
}

function renderStudentDashboard() {
  // Update Profile
  document.getElementById("dash-user-name").textContent = authState.user.name;
  document.getElementById("p-name").textContent = authState.user.name;

  // Render Table of Applications
  const appsTable = document.getElementById("student-apps-table");
  if (appsTable) {
    appsTable.innerHTML = applicationsDB
      .map(
        (app) => `
      <tr>
        <td><strong>${app.appId}</strong></td>
        <td>${app.schemeTitle}</td>
        <td>${app.date}</td>
        <td style="color:#065f46; font-weight:700;">${app.amount}</td>
        <td><span class="badge-success">${app.status}</span></td>
      </tr>
    `
      )
      .join("");
  }

  // Render Documents Vault
  const vault = document.getElementById("docs-vault-list");
  if (vault) {
    vault.innerHTML = "";
    uploadedDocsMap.forEach((val, key) => {
      vault.innerHTML += `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:0.85rem; border-radius:8px; display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <i class="fa-solid fa-file-pdf" style="font-size:1.5rem; color:#b91c1c;"></i>
          <div>
            <h4 style="font-size:0.85rem;">${key.split("-")[1]}</h4>
            <p style="font-size:0.72rem; color:#64748b;">${val.fileName} • Cryptographically Verified</p>
          </div>
        </div>
      `;
    });
  }
}

// --- OFFICER VERIFICATION DESK ---
function renderOfficerDashboard() {
  const table = document.getElementById("officer-queue-table");
  if (!table) return;

  table.innerHTML = applicationsDB
    .map(
      (app, idx) => `
    <tr>
      <td><strong>${app.appId}</strong></td>
      <td>${app.studentName}</td>
      <td>${app.schemeTitle}</td>
      <td><span class="badge-success"><i class="fa-solid fa-shield-halved"></i> Validated</span></td>
      <td><span style="font-size:0.75rem; color:#0284c7;"><i class="fa-solid fa-file-shield"></i> Verified Files</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="officerApprove(${idx})"><i class="fa-solid fa-check"></i> Approve for DBT</button>
      </td>
    </tr>
  `
    )
    .join("");
}

function officerApprove(index) {
  applicationsDB[index].status = "DBT Disbursed";
  applicationsDB[index].stage = 4;
  alert(`Application ${applicationsDB[index].appId} approved! Payment routed to PFMS pipeline.`);
  renderOfficerDashboard();
}

function handleGrievanceSubmit(event) {
  event.preventDefault();
  alert("Your grievance ticket has been registered. Ticket Ref: GRV-MoTA-2026-994. Assigned to District Welfare Officer.");
  event.target.reset();
}

// Global Filter Listeners
document.getElementById("input-income")?.addEventListener("input", renderSchemes);
document.getElementById("select-education")?.addEventListener("change", renderSchemes);
document.getElementById("input-marks")?.addEventListener("input", renderSchemes);

// Boot
updateAuthUI();
navigateTo("home");