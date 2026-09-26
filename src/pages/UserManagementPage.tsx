import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { User, Role } from '../types';
import { SEED_USERS } from '../services/api';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Search,
  Filter,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    SEED_USERS.EMPLOYEE,
    SEED_USERS.IT_STAFF,
    SEED_USERS.ADMIN,
    {
      id: 4,
      name: 'Sarah Connor',
      email: 's.connor@incidentiq.com',
      role: 'IT_STAFF',
      department: 'Hardware Support',
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 5,
      name: 'David Kim',
      email: 'd.kim@incidentiq.com',
      role: 'EMPLOYEE',
      department: 'Finance',
      isActive: true,
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('IT Department');
  const [newRole, setNewRole] = useState<Role>('EMPLOYEE');

  const handleRoleChange = (userId: number, role: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  };

  const handleToggleActive = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: User = {
      id: Date.now(),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      department: newDept,
      role: newRole,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              User & Role Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Admin console to manage corporate directory, assign IT staff roles, and configure account access
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, department..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-300 rounded-md py-2 px-3 text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="IT_STAFF">IT_STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role Permission</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user.email}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {user.department || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className={`text-xs font-bold rounded px-2.5 py-1 border transition-colors ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : user.role === 'IT_STAFF'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-[#1E40AF] border-blue-300'
                        }`}
                      >
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="IT_STAFF">IT_STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                          user.isActive
                            ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
                            : 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#1E40AF]" />
                  Add New Corporate User
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="r.adams@incidentiq.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-[#1E40AF]"
                  >
                    <option value="IT Department">IT Department</option>
                    <option value="Network Team">Network Team</option>
                    <option value="Security Operations">Security Operations</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-[#1E40AF]"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard Self-Service Portal)</option>
                    <option value="IT_STAFF">IT_STAFF (Triage, Diagnosis & Resolution Queue)</option>
                    <option value="ADMIN">ADMIN (Full Governance & SLA Configuration)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1E40AF] text-white rounded text-xs font-semibold hover:bg-blue-900 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
