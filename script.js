const invoiceForm = document.getElementById("invoiceForm");
const invoiceTableBody = document.getElementById("invoiceTableBody");
const searchInput = document.getElementById("searchInput");

const totalRevenue = document.getElementById("totalRevenue");
const paidAmountCard = document.getElementById("paidAmount");
const pendingAmountCard = document.getElementById("pendingAmount");
const overdueCount = document.getElementById("overdueCount");
const statusFilter = document.getElementById("statusFilter");
const themeToggle = document.getElementById("themeToggle");

const historyModal = document.getElementById("historyModal");
const closeModal = document.getElementById("closeModal");
const historyDetails = document.getElementById("historyDetails");
const dashboard = document.getElementById("dashboard");

const settingsThemeBtn = document.getElementById("settingsThemeBtn");
const clearDataBtn = document.getElementById("clearDataBtn");
const recordCount = document.getElementById("recordCount");
const exportBtn = document.getElementById("exportBtn");

let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
let editInvoiceId = null;

invoiceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const clientName = document.getElementById("clientName").value.trim();
    const projectName = document.getElementById("projectName").value.trim();
    const projectType = document.getElementById("projectType").value;
    const quoteAmount = Number(document.getElementById("quoteAmount").value);
    const paidAmount = Number(document.getElementById("paidInput").value);
    const dueDate = document.getElementById("dueDate").value;
    if (paidAmount > quoteAmount) {
    alert("Paid amount cannot exceed quote amount.");
    return;
}

if (quoteAmount <= 0 || paidAmount < 0) {
    alert("Enter valid amounts.");
    return;
}

    const pendingAmount = quoteAmount - paidAmount;

    let status = "Pending";

const today = new Date();
const invoiceDueDate = new Date(dueDate);

if (paidAmount === quoteAmount) {
    status = "Paid";
} else if (invoiceDueDate < today && paidAmount < quoteAmount) {
    status = "Overdue";
} else if (paidAmount > 0 && paidAmount < quoteAmount) {
    status = "Partial";
}

    const invoiceData = {
        id: editInvoiceId || generateInvoiceId(),
        clientName,
        projectName,
        projectType,
        quoteAmount,
        paidAmount,
        pendingAmount,
        dueDate,
        status
    };

    if (editInvoiceId) {
        invoices = invoices.map(invoice =>
            invoice.id === editInvoiceId ? invoiceData : invoice
        );

        editInvoiceId = null;
    } else {
        invoices.push(invoiceData);
    }
    localStorage.setItem("invoices", JSON.stringify(invoices));

    renderInvoices();
    invoiceForm.reset();
});

function renderInvoices(filteredInvoices = invoices) {
    dashboard.style.display = "grid";
    invoiceTableBody.innerHTML = "";

    filteredInvoices.forEach((invoice) => {
        const progress = Math.min((invoice.paidAmount / invoice.quoteAmount) * 100, 100);
        const row = `
            <tr>
                <td>${invoice.id}</td>
                <td>${invoice.clientName}</td>
                <td>${invoice.projectName}</td>
                <td>${invoice.projectType}</td>
                <td>₹${invoice.quoteAmount}</td>
                <td>₹${invoice.paidAmount}</td>
                <td>₹${invoice.pendingAmount}</td>
                <td>${invoice.dueDate}</td>
                <td>
    <span class="status ${invoice.status.toLowerCase()}">
        ${invoice.status}
    </span>
</td>
<td>
    <div>${Math.round(progress)}%</div>
    <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
    </div>
</td>
                <td>
    <button class="action-btn edit-btn" onclick="editInvoice(${invoice.id})">Edit</button>
    <button class="action-btn delete-btn" onclick="deleteInvoice(${invoice.id})">Delete</button>
    <button class="action-btn history-btn" onclick="showHistory(${invoice.id})">History</button>
</td>
            </tr>
        `;

        invoiceTableBody.innerHTML += row;
    });

    updateDashboard();
}

function deleteInvoice(id) {
    invoices = invoices.filter(invoice => invoice.id !== id);
     localStorage.setItem("invoices", JSON.stringify(invoices));
    renderInvoices();
}

function editInvoice(id) {
    const invoice = invoices.find(invoice => invoice.id === id);

    document.getElementById("clientName").value = invoice.clientName;
    document.getElementById("projectName").value = invoice.projectName;
    document.getElementById("projectType").value = invoice.projectType;
    document.getElementById("quoteAmount").value = invoice.quoteAmount;
    document.getElementById("paidInput").value = invoice.paidAmount;
    document.getElementById("dueDate").value = invoice.dueDate;

    editInvoiceId = id;
}
function updateDashboard() {
    let totalRevenueValue = 0;
    let totalPaidValue = 0;
    let totalPendingValue = 0;
    let overdueValue = 0;

    const today = new Date();

    invoices.forEach(invoice => {
        totalRevenueValue += invoice.quoteAmount;
        totalPaidValue += invoice.paidAmount;
        totalPendingValue += invoice.pendingAmount;

        const dueDate = new Date(invoice.dueDate);

        if (dueDate < today && invoice.status !== "Paid") {
            overdueValue++;
        }
    });

    totalRevenue.textContent = `₹${totalRevenueValue}`;
    paidAmountCard.textContent = `₹${totalPaidValue}`;
    pendingAmountCard.textContent = `₹${totalPendingValue}`;
    overdueCount.textContent = overdueValue;
}
updateDashboard();
updateRecordCount();
function filterInvoices() {
    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    let filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.clientName.toLowerCase().includes(searchText) ||
            invoice.projectName.toLowerCase().includes(searchText) ||
            invoice.projectType.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            invoice.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    renderInvoices(filteredInvoices);
}

statusFilter.addEventListener("change", function () {
    filterInvoices();
});
renderInvoices();
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}
function showHistory(id) {
    const invoice = invoices.find(invoice => invoice.id === id);

    historyDetails.innerHTML = `
        <p><strong>Client:</strong> ${invoice.clientName}</p>
        <p><strong>Project:</strong> ${invoice.projectName}</p>
        <p><strong>Quote Amount:</strong> ₹${invoice.quoteAmount}</p>
        <p><strong>Paid Amount:</strong> ₹${invoice.paidAmount}</p>
        <p><strong>Pending Amount:</strong> ₹${invoice.pendingAmount}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
    `;

    historyModal.style.display = "flex";
}

closeModal.addEventListener("click", function () {
    historyModal.style.display = "none";
});

window.addEventListener("click", function (e) {
    if (e.target === historyModal) {
        historyModal.style.display = "none";
    }
});

function showSection(sectionId, clickedItem) {
    const dashboard = document.getElementById("dashboard");
    const invoice = document.getElementById("invoice");
    const payments = document.getElementById("payments");
    const settings = document.getElementById("settings");

    dashboard.style.display = "none";
    invoice.style.display = "none";
    payments.style.display = "none";
    settings.style.display = "none";

    if (sectionId === "dashboard") {
        dashboard.style.display = "grid";
        invoice.style.display = "block";
        payments.style.display = "block";
    }

    if (sectionId === "invoice") {
        invoice.style.display = "block";
    }

    if (sectionId === "payments") {
        payments.style.display = "block";
    }

    if (sectionId === "settings") {
        settings.style.display = "block";
    }

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
    });

    clickedItem.classList.add("active");
}
function updateRecordCount() {
    recordCount.textContent = `${invoices.length} invoices saved`;
}
settingsThemeBtn.addEventListener("click", function () {
    themeToggle.click();
});

clearDataBtn.addEventListener("click", function () {
    if (confirm("Delete all invoices?")) {
        invoices = [];
        localStorage.removeItem("invoices");
        renderInvoices();
    }
});
function generateInvoiceId() {
    const invoiceCount = invoices.length + 1;
    return `INV-${String(invoiceCount).padStart(3, "0")}`;
}
exportBtn.addEventListener("click", exportCSV);

function exportCSV() {
    let csvRows = [];

    csvRows.push([
        "Invoice ID",
        "Client",
        "Project",
        "Type",
        "Quote",
        "Paid",
        "Pending",
        "Due Date",
        "Status"
    ]);

    invoices.forEach(invoice => {
        csvRows.push([
            invoice.id,
            invoice.clientName,
            invoice.projectName,
            invoice.projectType,
            invoice.quoteAmount,
            invoice.paidAmount,
            invoice.pendingAmount,
            invoice.dueDate,
            invoice.status
        ]);
    });

    const csvContent = csvRows
        .map(row => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "invoice_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}