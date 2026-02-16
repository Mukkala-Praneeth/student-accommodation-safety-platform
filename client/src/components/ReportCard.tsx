import React from 'react';
import { ImageGallery } from './ImageGallery';
import UpvoteButton from './UpvoteButton';

interface Image {
  url: string;
  publicId?: string;
}

interface Report {
  _id: string;
  accommodationName: string;
  issueType: string;
  description: string;
  images?: Image[];
  createdAt: string;
  status?: string;
  upvotes?: number;
  upvotedBy?: string[];
  user?: string;
}

interface ReportCardProps {
  report: Report;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onEdit, onDelete, currentUserId }) => {
  const getIssueBadgeClass = (issueType: string): string => {
    const classes: { [key: string]: string } = {
      'Food Safety': 'badge-danger',
      'Water Quality': 'badge-warning',
      'Hygiene': 'badge-info',
      'Security': 'badge-danger',
      'Infrastructure': 'badge-warning'
    };
    return classes[issueType] || 'badge-default';
  };

  const getStatusBadgeClass = (status: string): string => {
    const classes: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="report-card my-report-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="report-header flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{report.accommodationName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide ${getStatusBadgeClass(report.status || 'pending')}`}>
            {report.status || 'pending'}
          </span>
        </div>
        <span className={`badge ${getIssueBadgeClass(report.issueType)}`}>
          {report.issueType}
        </span>
      </div>
      
      <div className="report-body mb-4">
        <p className="description text-gray-600 mb-4 line-clamp-3">{report.description}</p>
        <ImageGallery images={report.images} />
      </div>

      <div className="report-footer flex flex-wrap gap-4 text-sm text-gray-500 mb-4 pt-3 border-t">
        <span className="date flex items-center">
          📅 {new Date(report.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
        <span className="time flex items-center">
          🕒 {new Date(report.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {currentUserId && (
        <div className="mb-3">
          <UpvoteButton
            reportId={report._id}
            initialUpvotes={report.upvotes || 0}
            initialHasUpvoted={(report.upvotedBy || []).includes(currentUserId)}
            isOwnReport={report.user === currentUserId}
          />
        </div>
      )}

      <div className="report-actions flex gap-2">
        <button 
          className="btn-secondary btn-sm flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition-colors"
          onClick={() => onEdit(report)}
        >
          Edit
        </button>
        <button 
          className="btn-danger btn-sm flex-1 py-2 bg-red-50 hover:bg-red-100 rounded text-red-600 font-medium transition-colors"
          onClick={() => onDelete(report._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default React.memo(ReportCard);
