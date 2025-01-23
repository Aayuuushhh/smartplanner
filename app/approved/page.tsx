// PreviouslyApproved.js

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Input } from '@headlessui/react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { acceptRequest, getApprovedRequest } from '@/utils/api';

type ApprovalItem = {
  id: Number;
  displayname: string;
  emailid: string;
  isapproved: boolean;
};

export default function PreviouslyApproved() {
  const [searchTerm, setSearchTerm] = useState('');
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) {
          throw new Error('Authentication token not found');
        }
        const approvedData = await getApprovedRequest(token);
        setApprovedItems(Array.isArray(approvedData) ? approvedData : []);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUnapprove = async (item: ApprovalItem) => {
    try {
      const token = localStorage.getItem('token') || '';
      if (!token) {
        throw new Error('Authentication token not found');
      }
      await acceptRequest(item.id, 'cancel', token);
      setApprovedItems(approvedItems.filter(i => i.id !== item.id));
    } catch (err) {
      setError('Failed to unapprove item. Please try again.');
    }
  };

  const filteredApprovedItems = approvedItems.filter(item =>
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
      <Card>
        <CardHeader title="Previously Approved" />
        <CardContent>
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {filteredApprovedItems.length > 0 ? (
                filteredApprovedItems.map(item => (
                  <li key={item.id.toString()} className="flex justify-between items-center">
                    <span>{item.displayname} ({item.emailid})</span>
                    <Button variant="contained" onClick={() => handleUnapprove(item)}>Unapprove</Button>
                  </li>
                ))
              ) : (
                <div className="text-center">No approved items found.</div>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
