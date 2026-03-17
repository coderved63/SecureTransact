import { useState, useEffect } from 'react';
import { accountApi, transactionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Send, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FLAGGED: 'bg-red-100 text-red-800',
  FAILED: 'bg-gray-100 text-gray-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewTxn, setShowNewTxn] = useState(false);
  const [accountForm, setAccountForm] = useState({ accountType: 'SAVINGS', initialDeposit: '' });
  const [txnForm, setTxnForm] = useState({ type: 'DEPOSIT', amount: '', fromAccountId: '', toAccountId: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, txnRes] = await Promise.all([
        accountApi.getAll(),
        transactionApi.getHistory(),
      ]);
      setAccounts(accRes.data);
      setTransactions(txnRes.data.content || []);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await accountApi.create({
        accountType: accountForm.accountType,
        initialDeposit: parseFloat(accountForm.initialDeposit) || 0,
      });
      setShowNewAccount(false);
      setAccountForm({ accountType: 'SAVINGS', initialDeposit: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        type: txnForm.type,
        amount: parseFloat(txnForm.amount),
        description: txnForm.description,
        idempotencyKey: crypto.randomUUID(),
      };
      if (txnForm.type === 'DEPOSIT') payload.toAccountId = parseInt(txnForm.toAccountId);
      if (txnForm.type === 'WITHDRAWAL') payload.fromAccountId = parseInt(txnForm.fromAccountId);
      if (txnForm.type === 'TRANSFER') {
        payload.fromAccountId = parseInt(txnForm.fromAccountId);
        payload.toAccountId = parseInt(txnForm.toAccountId);
      }
      await transactionApi.submit(payload);
      setShowNewTxn(false);
      setTxnForm({ type: 'DEPOSIT', amount: '', fromAccountId: '', toAccountId: '', description: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowNewAccount(!showNewAccount)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Account
          </button>
          <button onClick={() => setShowNewTxn(!showNewTxn)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Send className="w-4 h-4" /> New Transaction
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      {/* New Account Form */}
      {showNewAccount && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Account</h2>
          <form onSubmit={createAccount} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={accountForm.accountType}
                onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                className="px-3 py-2 border rounded-lg">
                <option value="SAVINGS">Savings</option>
                <option value="CHECKING">Checking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Deposit</label>
              <input type="number" min="0" step="0.01" value={accountForm.initialDeposit}
                onChange={(e) => setAccountForm({ ...accountForm, initialDeposit: e.target.value })}
                className="px-3 py-2 border rounded-lg" placeholder="0.00" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Create</button>
          </form>
        </div>
      )}

      {/* New Transaction Form */}
      {showNewTxn && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Transaction</h2>
          <form onSubmit={submitTransaction} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={txnForm.type}
                  onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" min="0.01" step="0.01" required value={txnForm.amount}
                  onChange={(e) => setTxnForm({ ...txnForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              {(txnForm.type === 'WITHDRAWAL' || txnForm.type === 'TRANSFER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                  <select value={txnForm.fromAccountId}
                    onChange={(e) => setTxnForm({ ...txnForm, fromAccountId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" required>
                    <option value="">Select...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.accountNumber} (${a.balance})</option>
                    ))}
                  </select>
                </div>
              )}
              {(txnForm.type === 'DEPOSIT' || txnForm.type === 'TRANSFER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                  {txnForm.type === 'DEPOSIT' ? (
                    <select value={txnForm.toAccountId}
                      onChange={(e) => setTxnForm({ ...txnForm, toAccountId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg" required>
                      <option value="">Select...</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.accountNumber} (${a.balance})</option>
                      ))}
                    </select>
                  ) : (
                    <input type="number" value={txnForm.toAccountId}
                      onChange={(e) => setTxnForm({ ...txnForm, toAccountId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg" placeholder="Account ID" required />
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input type="text" value={txnForm.description}
                onChange={(e) => setTxnForm({ ...txnForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Submit</button>
          </form>
        </div>
      )}

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">{account.accountType}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {account.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-mono">{account.accountNumber}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No accounts yet. Create one to get started.
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-2">
                    {txn.type === 'DEPOSIT' && <ArrowDownCircle className="w-4 h-4 text-green-500" />}
                    {txn.type === 'WITHDRAWAL' && <ArrowUpCircle className="w-4 h-4 text-red-500" />}
                    {txn.type === 'TRANSFER' && <ArrowRightLeft className="w-4 h-4 text-blue-500" />}
                    {txn.type}
                  </td>
                  <td className="px-6 py-4 font-medium">${Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[txn.status] || ''}`}>{txn.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {txn.riskScore > 50 && <AlertTriangle className="w-4 h-4 text-red-500 inline" />}
                    <span className="text-sm text-gray-600 ml-1">{txn.riskScore ?? 0}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(txn.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
