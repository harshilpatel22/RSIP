import React, { useState } from 'react';
import { IssueDetailModal } from './IssueDetailModal';

export const IssueCard = ({ issue }) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div 
        className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowDetail(true)}
      >
        {/* Existing issue card content */}
        <h3 className="font-medium">{issue.category.en}</h3>
        <p className="text-sm text-gray-500">{issue.location.address}</p>
        <p className="text-sm">{issue.description}</p>
      </div>

      <IssueDetailModal
        issueId={issue.id}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
};