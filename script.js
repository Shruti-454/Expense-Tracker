import { generateChart } from './chart.js';
import { formatDate, updateTotal } from './utils.js';
import { exportCSV } from './export.js';

const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total');
const monthFilter = document.getElementById('filter-month');
const categoryFilter = document.getElementById('filter-category');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('toggle-theme');

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const googleBtn = document.getElementById("google-login");
const logoutBtn = document.getElementById("logout-btn");
const authStatus = document.getElementById("auth-status");
const exportBtn = document.getElementById("export-btn");

const mainUI = document.getElementById("main-ui");

const db = firebase.firestore();
let expenses = [];
let userId = null;

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    userId = user.uid;
    authStatus.textContent = `Logged in as: ${user.email}`;
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = registerBtn.style.display = googleBtn.style.display = "none";
    mainUI.style.display = "block";
    await loadExpenses();
  } else {
    userId = null;
    authStatus.textContent = "Not logged in";
    logoutBtn.style.display = "none";
    loginBtn.style.display = registerBtn.style.display = googleBtn.style.display = "inline-block";
    mainUI.style.display = "none";
  }
});

loginBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
  } catch (err) {
    alert(err.message);
  }
};

registerBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    const res = await firebase.auth().createUserWithEmailAndPassword(email, pass);
    await db.collection("expenses").doc(res.user.uid).set({ data: [] });
  } catch (err) {
    alert(err.message);
  }
};

googleBtn.onclick = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await firebase.auth().signInWithPopup(provider);
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
};

logoutBtn.onclick = () => {
  firebase.auth().signOut();
  expenses = [];
  render();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const desc = document.getElementById("description").value;
  const amt = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const cat = document.getElementById("category").value;

  expenses.push({ description: desc, amount: amt, date, category: cat });
  await saveExpensesToCloud();
  render();
  form.reset();
});

exportBtn.onclick = () => {
  exportCSV(expenses);
};

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

[monthFilter, categoryFilter, searchInput].forEach(input => {
  input.addEventListener("input", render);
});

window.deleteExpense = async (index) => {
  expenses.splice(index, 1);
  await saveExpensesToCloud();
  render();
};

window.editExpense = async (index) => {
  const item = expenses[index];
  document.getElementById("description").value = item.description;
  document.getElementById("amount").value = item.amount;
  document.getElementById("date").value = item.date;
  document.getElementById("category").value = item.category;
  expenses.splice(index, 1);
  await saveExpensesToCloud();
  render();
};

async function loadExpenses() {
  const doc = await db.collection("expenses").doc(userId).get();
  expenses = doc.exists ? doc.data().data : [];
  render();
}

async function saveExpensesToCloud() {
  await db.collection("expenses").doc(userId).set({ data: expenses });
}

function render() {
  list.innerHTML = "";
  let filtered = [...expenses];

  const selectedMonth = monthFilter.value;
  const selectedCategory = categoryFilter.value;
  const keyword = searchInput.value.toLowerCase();

  if (selectedMonth)
    filtered = filtered.filter(e => e.date.startsWith(selectedMonth));
  if (selectedCategory !== "All")
    filtered = filtered.filter(e => e.category === selectedCategory);
  if (keyword)
    filtered = filtered.filter(e => e.description.toLowerCase().includes(keyword));

  filtered.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${e.date} - ${e.description} - ₹${e.amount} [${e.category}]
      <span>
        <button onclick="editExpense(${i})">✏</button>
        <button onclick="deleteExpense(${i})">🗑</button>
      </span>`;
    list.appendChild(li);
  });

  updateTotal(filtered, totalDisplay);
  generateChart(filtered, document.getElementById("expense-chart"));
}
