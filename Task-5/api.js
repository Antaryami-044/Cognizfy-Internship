const API = "/api/submissions";
const $ = (id) => document.getElementById(id);

function clearForm() {
  $("editId").value = "";
  $("apiName").value = "";
  $("apiEmail").value = "";
  $("apiAge").value = "";
  $("apiMessage").value = "";
  $("saveBtn").textContent = "Save";
  $("cancelEdit").style.display = "none";
}

async function loadTable() {
  const res = await fetch(API);
  const json = await res.json();
  const data = json.data || [];

  const tbody = $("tableBody");
  tbody.innerHTML = "";

  data.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${row.name}</td>
      <td>${row.email}</td>
      <td>${row.age}</td>
      <td>${row.message || ""}</td>
      <td>
        <button class="btn btn-small" data-edit="${row.id}">Edit</button>
        <button class="btn btn-small btn-danger" data-del="${row.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function createOrUpdate(e) {
  e.preventDefault();
  const id = $("editId").value.trim();
  const payload = {
    name: $("apiName").value.trim(),
    email: $("apiEmail").value.trim(),
    age: Number($("apiAge").value),
    message: $("apiMessage").value.trim()
  };

  if (!payload.name || !payload.email || !payload.age) return;

  const opts = {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
  const url = id ? `${API}/${id}` : API;
  await fetch(url, opts);

  clearForm();
  await loadTable();
}

async function onTableClick(e) {
  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");

  if (editId) {
    const res = await fetch(`${API}/${editId}`);
    const json = await res.json();
    const row = json.data;

    $("editId").value = row.id;
    $("apiName").value = row.name;
    $("apiEmail").value = row.email;
    $("apiAge").value = row.age;
    $("apiMessage").value = row.message || "";

    $("saveBtn").textContent = "Update";
    $("cancelEdit").style.display = "inline-block";
  }

  if (delId) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`${API}/${delId}`, { method: "DELETE" });
    await loadTable();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("apiForm").addEventListener("submit", createOrUpdate);
  $("cancelEdit").addEventListener("click", clearForm);
  $("apiTable").addEventListener("click", onTableClick);
  loadTable();
});
