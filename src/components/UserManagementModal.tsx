import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Shield, User as UserIcon, Plus, CheckCircle2, Ban, Edit2 } from 'lucide-react';

interface UserManagementModalProps {
  users: User[];
  currentUser: User;
  onUpdateUsers: (updated: User[]) => void;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  users,
  currentUser,
  onUpdateUsers,
  onClose
}) => {
  const [userList, setUserList] = useState<User[]>(users);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');

  const handleToggleActive = (id: string) => {
    const updated = userList.map(u => {
      if (u.id === id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    setUserList(updated);
    onUpdateUsers(updated);
  };

  const handleRoleChange = (id: string, role: UserRole) => {
    const updated = userList.map(u => {
      if (u.id === id) {
        return { ...u, role };
      }
      return u;
    });
    setUserList(updated);
    onUpdateUsers(updated);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      name: newName.trim(),
      role: newRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updated = [...userList, newUser];
    setUserList(updated);
    onUpdateUsers(updated);
    setNewEmail('');
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Admin: User & RBAC Management</h3>
              <p className="text-xs text-slate-400">Manage user accounts, roles, and system permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-200">System Users ({userList.length})</h4>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <h5 className="font-semibold text-xs text-indigo-400 uppercase tracking-wider">New User Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Email (Username)</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Role Permission</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="user">Standard User (Operations)</option>
                    <option value="admin">Admin (Manager)</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="px-3 py-2 rounded-xl bg-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
                  >
                    Save User
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* User Table */}
          <div className="space-y-3">
            {userList.map(u => (
              <div key={u.id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    u.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{u.name}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">You</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={u.role}
                    disabled={u.id === currentUser.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white disabled:opacity-50"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    onClick={() => handleToggleActive(u.id)}
                    disabled={u.id === currentUser.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                      u.isActive 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    }`}
                  >
                    {u.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                    <span>{u.isActive ? 'Active' : 'Deactivated'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
