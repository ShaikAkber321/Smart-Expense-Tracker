/**
 * Expenses Management Controller
 * Handles table rendering, dynamic filtering, search, edit modal, and deletions.
 */

let allExpenses = [];

async function fetchExpenses() {
  const search = document.getElementById('filterSearch').value.trim();
  const category = document.getElementById('filterCategory').value;
  const paymentMethod = document.getElementById('filterPaymentMethod').value;
  const sortVal = document.getElementById('filterSort').value.split('-');
  const sortBy = sortVal[0];
  const order = sortVal[1] || 'desc';
  const startDate = document.getElementById('filterStartDate').value;
  const endDate = document.getElementById('filterEndDate').value;

  const params = new URLSearchParams({
    search: search,
    category: category,
    payment_method: paymentMethod,
    sort_by: sortBy,
    order: order,
  });

  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  try {
    const res = await fetch(`/api/expenses?${params.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    allExpenses = json.data.expenses;
    renderTable(allExpenses);

    document.getElementById('filteredStats').innerText =
      `${json.data.total_count} records • Total: ₹${json.data.total_amount.toLocaleString('en-IN')}`;
  } catch (err) {
    console.error('Error fetching expenses', err);
    document.getElementById('expensesTableBody').innerHTML =
      `<tr><td colspan="6" class="p-6 text-center text-rose-500">Failed to load expenses.</td></tr>`;
  }
}

function renderTable(expenses) {
  const tbody = document.getElementById('expensesTableBody');
  if (!expenses || expenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400">No matching expenses found.</td></tr>`;
    return;
  }

  tbody.innerHTML = expenses.map(e => `
    <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td class="px-6 py-4">
        <div class="font-semibold text-slate-900">${e.title}</div>
        ${e.description ? `<div class="text-xs text-slate-400 mt-0.5 truncate max-w-xs">${e.description}</div>` : ''}
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          ${e.category}
        </span>
      </td>
      <td class="px-6 py-4 text-slate-500 text-xs">${e.expense_date}</td>
      <td class="px-6 py-4 text-slate-600 text-xs font-medium">${e.payment_method}</td>
      <td class="px-6 py-4 text-right font-bold font-display text-slate-900">₹${e.amount.toLocaleString('en-IN')}</td>
      <td class="px-6 py-4 text-right space-x-2">
        <button onclick="openEditModal(${e.id})" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Edit</button>
        <button onclick="deleteExpense(${e.id})" class="text-xs font-semibold text-rose-600 hover:text-rose-800">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.openEditModal = function(id) {
  const exp = allExpenses.find(e => e.id === id);
  if (!exp) return;

  document.getElementById('editExpenseId').value = exp.id;
  document.getElementById('editTitle').value = exp.title;
  document.getElementById('editAmount').value = exp.amount;
  document.getElementById('editCategory').value = exp.category;
  document.getElementById('editDate').value = exp.expense_date;
  document.getElementById('editPaymentMethod').value = exp.payment_method;
  document.getElementById('editDescription').value = exp.description || '';

  document.getElementById('editModal').classList.remove('hidden');
};

window.deleteExpense = async function(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  try {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      fetchExpenses();
    } else {
      alert('Delete failed: ' + json.message);
    }
  } catch (err) {
    alert('Failed to delete expense.');
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchExpenses();

  const searchInput = document.getElementById('filterSearch');
  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fetchExpenses, 300);
  });

  document.getElementById('filterCategory').addEventListener('change', fetchExpenses);
  document.getElementById('filterPaymentMethod').addEventListener('change', fetchExpenses);
  document.getElementById('filterSort').addEventListener('change', fetchExpenses);
  document.getElementById('filterStartDate').addEventListener('change', fetchExpenses);
  document.getElementById('filterEndDate').addEventListener('change', fetchExpenses);

  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterCategory').value = 'All';
    document.getElementById('filterPaymentMethod').value = 'All';
    document.getElementById('filterSort').value = 'date-desc';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    fetchExpenses();
  });

  // Edit Modal controls
  const editModal = document.getElementById('editModal');
  document.getElementById('closeEditModal').addEventListener('click', () => editModal.classList.add('hidden'));
  document.getElementById('cancelEditBtn').addEventListener('click', () => editModal.classList.add('hidden'));

  document.getElementById('editExpenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editExpenseId').value;
    const payload = {
      title: document.getElementById('editTitle').value.trim(),
      amount: parseFloat(document.getElementById('editAmount').value),
      category: document.getElementById('editCategory').value,
      expense_date: document.getElementById('editDate').value,
      payment_method: document.getElementById('editPaymentMethod').value,
      description: document.getElementById('editDescription').value.trim(),
    };

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        editModal.classList.add('hidden');
        fetchExpenses();
      } else {
        alert(json.errors ? json.errors.join('\n') : json.message);
      }
    } catch (err) {
      alert('Failed to update expense: ' + err.message);
    }
  });
});
