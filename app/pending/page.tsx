// PendingApproval.js

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Input } from '@headlessui/react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { acceptRequest, getPendingRequests } from '@/utils/api';

type ApprovalItem = {
  id: Number;
  displayname: string;
  emailid: string;
  isapproved: boolean;
};

export default function PendingApproval() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) {
          throw new Error('Authentication token not found');
        }
        const pendingData = await getPendingRequests(token);
        setPendingApprovals(Array.isArray(pendingData) ? pendingData : []);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (item: ApprovalItem) => {
    try {
      const token = localStorage.getItem('token') || '';
      if (!token) {
        throw new Error('Authentication token not found');
      }
      await acceptRequest(item.id, 'approve', token);
      setPendingApprovals(pendingApprovals.filter(i => i.id !== item.id));
    } catch (err) {
      setError('Failed to approve item. Please try again.');
    }
  };

  const filteredPendingApprovals = pendingApprovals.filter(item =>
    item.emailid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Input
        type="text"
        placeholder="Search emails..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <Card className="mb-4">
        <CardHeader title="Pending Approval" />
        <CardContent>
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {filteredPendingApprovals.length > 0 ? (
                filteredPendingApprovals.map(item => (
                  <li key={item.id.toString()} className="flex justify-between items-center">
                    <span>{item.displayname} ({item.emailid})</span>
                    <Button variant="contained" onClick={() => handleApprove(item)}>Approve</Button>
                  </li>
                ))
              ) : (
                <div className="text-center">No pending approvals found.</div>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
