"use client"
import React, { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isAdminState } from '@/app/recoil/atom'; // Assume this is defined in an atoms.ts file
import { getSchoolAdmin, SchoolAdminFunction } from '@/utils/api';

interface SchoolAdmin {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}


const ITEMS_PER_PAGE = 5;

export default function AdminPanel() {
  const [isAdmin , setIsAdmin] = useRecoilState(isAdminState);
  const [admins, setAdmins] = useState<SchoolAdmin[]>([]);
  const [newAdminFirstname, setNewAdminFirstname] = useState('');
  const [newAdminLastname, setNewAdminLastname] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);
  const paginatedAdmins = admins.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getAdmins = async () =>{
    const token = localStorage.getItem('token') || '';
    const admins = await getSchoolAdmin(token) ; 
    setAdmins(admins);
    return admins.length > 0  ? true : false  ; 
  }

  useEffect(() => {
    setInterval(() => {
      console.log(isAdmin) ; 
    }, 5000) ; 
    if (isAdmin) {
      getAdmins();
    }
  }, [isAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
     const resposne = await SchoolAdminFunction(localStorage.getItem('token') || '' , newAdminEmail,  "add");
      getAdmins();
      if(resposne){
        showToast('School admin added successfully', 'success');
      } 
      setNewAdminEmail('');
    } catch (error) {
      showToast('Failed to add school admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (confirmText !== 'delete' || !adminToRemove) return;

    setLoading(true);
    try {
      const resposne = await SchoolAdminFunction(localStorage.getItem('token') || '' , adminToRemove,  "remove");
      getAdmins();
      if(resposne){
        showToast('School admin removed successfully', 'success');
      } 
      setAdmins(admins.filter(admin => admin.id !== adminToRemove));
      showToast('School admin removed successfully', 'success');
      setRemoveDialogOpen(false);
      setAdminToRemove(null);
      setConfirmText('');
    } catch (error) {
      showToast('Failed to remove school admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // This is a simple implementation. You might want to use a more sophisticated toast library.
    alert(`${type.toUpperCase()}: ${message}`);
  };

  if (!isAdmin) {
    return <>
      <div className='text-center font-extrabold text-red-800 text-7xl'>Sorry!! You aren&apos;t Authorized to visit this page</div>;
    </>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">School Admin Panel</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add School Admin</h2>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add School Admin'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">School Admin List</h2>
        <ul className="divide-y divide-gray-200">
          {paginatedAdmins.map((admin) => (
            <li key={admin.id} className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{admin.firstname} {admin.lastname}</h3>
                <p className="text-gray-600">{admin.email}</p>
                <p className="text-gray-400 text-sm">ID: {admin.id}</p>
              </div>
              <button 
                onClick={() => {
                  setAdminToRemove(admin.id);
                  setRemoveDialogOpen(true);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center p-6 border-t">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {removeDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Remove School Admin</h2>
            <p className="mb-4">Are you sure you want to remove this school admin? This action cannot be undone.</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRemoveDialogOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAdmin}
                disabled={confirmText !== 'delete' || loading}
                className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

