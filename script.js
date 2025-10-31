// --- Default Documentation Pages ---
let pages = JSON.parse(localStorage.getItem("pinltyDocs")) || {
  intro: `
    <h2>Introduction</h2>
    <p>Welcome to the Pinlty Documentation! This guide helps you understand how to use and expand the Pinlty engine.</p>
  `,
  setup: `
    <h2>Setup</h2>
    <p>1. Clone or download the Pinlty repository.<br>
    2. Open it in your preferred editor.<br>
    3. Run <code>npm install</code> or set up your local environment.</p>
  `,
  usage: `
    <h2>Usage</h2>
    <p>Pinlty provides tools to create 3D and 2D experiences. Extend it with C#, GLSL, or OpenTK scripts depending on your module type.</p>
  `,
  editor: {
    overview: `
      <h2>Editor Overview</h2>
      <p>The Editor is the main window for managing assets, scenes, and settings.<br>
      It’s where you create and modify game content visually.</p>
    `,
    assets: `
      <h2>Editor: Assets</h2>
      <p>The Assets panel shows your project’s imported files.<br>
      You can drag and drop new models, textures, or scripts here.</p>
    `,
  },
  coding: {
    pin: `
      <h2>Coding: .Pin<h2>
      <p>The .Pin language is the language you use to create scripts that then get combined in the .PinM language. An Example of a script:<br>
      <code>func mStart() // mStart is the code that's run when the object is created<br>
      {<br>
      ||||print("this is the start"); /*print(); writes something to the console, (/)->(*) is a comment that ends and the (;) tells the compiler that this is the end of the line*/<br>
      }  // the {} are the encasing of custom things<br>
      <br>
      func doSomething()<br>
      {<br>
      ||||transform.position += vec3(0.0, 0.0, 1.0); /* the component that makes it exist */<br>
      }<br>
      <br>
      main.Start = mStart(); /*tells the .PinM what the start function is*/<br>
      main.Update = doSomething(); /*tells the .PinM what the update function is*/<br></code><p>
    `
  },
  faq: `
    <h2>FAQ</h2>
    <p><b>Q:</b> How do I contribute?<br>
    <b>A:</b> Fork the repo, make your changes, and submit a pull request!</p>
  `
};

// --- DOM Elements ---
const contentDiv = document.getElementById("content");
const links = document.querySelectorAll(".sidebar .file");
const editBtn = document.getElementById("editBtn");
const downloadBtn = document.getElementById("downloadBtn");

// --- Globals ---
let currentPage = "intro";
let editMode = false;

// --- Load a page (supports nested pages like "editor-overview") ---
function loadPage(page) {
  currentPage = page;
  if (editMode) disableEditMode();

  const parts = page.split("-");
  let content = pages;
  for (const part of parts) {
    if (content && typeof content === "object") content = content[part];
    else content = null;
  }

  contentDiv.innerHTML =
    content || "<h2>404</h2><p>Page not found.</p>";
}

// --- Enable / Disable Edit Mode ---
function enableEditMode() {
  editMode = true;

  const parts = currentPage.split("-");
  let ref = pages;
  for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
  const last = parts[parts.length - 1];
  const html = ref[last] || "";

  contentDiv.innerHTML = `
    <textarea class="editor">${html}</textarea>
    <button id="saveBtn">💾 Save</button>
  `;

  document.getElementById("saveBtn").addEventListener("click", saveEdit);
  editBtn.textContent = "❌ Exit Edit Mode";
}

function disableEditMode() {
  editMode = false;
  loadPage(currentPage);
  editBtn.textContent = "✏ Edit Mode";
}

// --- Save Edit ---
function saveEdit() {
  const newContent = document.querySelector(".editor").value;

  const parts = currentPage.split("-");
  let ref = pages;
  for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
  const last = parts[parts.length - 1];
  ref[last] = newContent;

  localStorage.setItem("pinltyDocs", JSON.stringify(pages));
  disableEditMode();
}

// --- Download Docs ---
function downloadDocs() {
  const blob = new Blob([JSON.stringify(pages, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "PinltyDocs.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- Sidebar: expand/collapse folders ---
document.querySelectorAll(".folder-title").forEach(folder => {
  folder.addEventListener("click", e => {
    e.stopPropagation();
    const parent = folder.parentElement;
    parent.classList.toggle("expanded");
  });
});

// --- Sidebar: file click loads content ---
links.forEach(link => {
  link.addEventListener("click", e => {
    e.stopPropagation();
    loadPage(e.target.getAttribute("data-page"));
  });
});

// --- Top bar buttons ---
editBtn.addEventListener("click", () => {
  editMode ? disableEditMode() : enableEditMode();
});

downloadBtn.addEventListener("click", downloadDocs);

// --- Default load ---
loadPage("intro");

// --- Sidebar Resizer ---
const sidebar = document.getElementById("sideBar");
const resizer = document.getElementById("resizer");

let isResizing = false;

resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "ew-resize";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const newWidth = Math.min(Math.max(e.clientX, 180), 500); // between 180px–500px
  sidebar.style.width = newWidth + "px";
});

document.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "default";
  }
});