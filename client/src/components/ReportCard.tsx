import React from 'react';
import { ImageGallery } from './ImageGallery';
import UpvoteButton from './UpvoteButton';

interface Image {
  url: string;
  publicId?: string;
}

interface Resolution {
  description: string;
  actionTaken: string;
  images: Array<{ url: string; publicId: string }>;
  resolvedBy?: { name: string } | string;
  resolvedAt?: string;
}

interface Verification {
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  feedback?: string;
  isDisputed: boolean;
  disputeReason?: string;
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
  resolution?: Resolution;
  verification?: Verification;
}

interface ReportCardProps {
  report: Report;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
  onVerify?: (id: string, accepted: boolean, feedbackOrReason: string) => void;
  currentUserId?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onEdit, onDelete, onVerify, currentUserId }) => {
  const [showVerifyInput, setShowVerifyInput] = React.useState(false);
  const [isAccepting, setIsAccepting] = React.useState(true);
  const [feedback, setFeedback] = React.useState('');

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
      'pending': 'bg-gray-100 text-gray-800',
      'approved': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'disputed': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const handleVerifySubmit = () => {
    if (!isAccepting && !feedback) {
      alert('Please provide a reason for dispute');
      return;
    }
    if (onVerify) {
      onVerify(report._id, isAccepting, feedback);
      setShowVerifyInput(false);
      setFeedback('');
    }
  };

  return (
    <div className={`report-card my-report-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white status-${report.status}`}>
      <div className="report-header flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{report.accommodationName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide ${getStatusBadgeClass(report.status || 'pending')}`}>
            {report.status === 'resolved' ? 'Awaiting Your Verification' : (report.status || 'pending')}
          </span>
        </div>
        <span className={`badge ${getIssueBadgeClass(report.issueType)}`}>
          {report.issueType}
        </span>
      </div>
      
      <div className="report-body mb-4">
        <p className="description text-gray-600 mb-4 line-clamp-3">{report.description}</p>
        <ImageGallery images={report.images || []} />
      </div>

      {report.status === 'resolved' && report.resolution && (
        <div className="resolution-notice bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <h4 className="text-blue-800 font-bold text-sm mb-2">✅ Owner has marked this as fixed</h4>
          <p className="text-sm text-blue-700 mb-1"><strong>Action:</strong> {report.resolution.actionTaken}</p>
          <p className="text-sm text-blue-600 mb-2">{report.resolution.description}</p>
          <ImageGallery images={report.resolution.images || []} />
          
          {!showVerifyInput ? (
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => { setIsAccepting(true); setShowVerifyInput(true); }}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
              >
                Yes, Issue is Fixed
              </button>
              <button 
                onClick={() => { setIsAccepting(false); setShowVerifyInput(true); }}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
              >
                No, Issue Persists
              </button>
            </div>
          ) : (
            <div className="mt-3 bg-white p-3 rounded border border-blue-200">
              <label className="block text-xs font-bold mb-1 text-gray-700">
                {isAccepting ? 'Optional Feedback:' : 'Reason for Dispute (Required):'}
              </label>
              <textarea 
                className="w-full border rounded p-2 text-sm"
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={isAccepting ? "Anything you'd like to say about the fix?" : "Why is the issue still not resolved?"}
              />
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={handleVerifySubmit}
                  className={`text-white px-3 py-1 rounded text-sm font-medium ${isAccepting ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  Submit {isAccepting ? 'Verification' : 'Dispute'}
                </button>
                <button 
                  onClick={() => setShowVerifyInput(false)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {report.status === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-green-800 font-bold text-sm">✅ Resolved & Verified</p>
          {report.verification?.feedback && (
            <p className="text-sm text-green-700 mt-1 italic">"{report.verification.feedback}"</p>
          )}
        </div>
      )}

      {report.status === 'disputed' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 font-bold text-sm">⚠️ Disputed - Under Review</p>
          {report.verification?.disputeReason && (
            <p className="text-sm text-red-700 mt-1 italic">"{report.verification.disputeReason}"</p>
          )}
        </div>
      )}

      <div className="report-footer flex flex-wrap gap-4 text-sm text-gray-500 mb-4 pt-3 border-t">
        <span className="date flex items-center">
          📅 {report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'No date'}
        </span>
        <span className="time flex items-center">
          🕒 {report.createdAt ? new Date(report.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }) : 'No time'}
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
