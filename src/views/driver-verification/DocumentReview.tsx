import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  Shield,
  Camera,
  User,
  File,
  Edit,
  Trash2
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Avatar from '@radix-ui/react-avatar';
import { toast } from 'react-toastify';
import { driverService } from '../../services/driver.service';
import { VerificationDetail, Document, DocumentStatus } from '../../types/driver.types';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const DocumentReview: React.FC = () => {
  const { verificationId } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();
  
  const [verificationDetail, setVerificationDetail] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<DocumentStatus>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editImage, setEditImage] = useState<File | null>(null);

  useEffect(() => {
    if (verificationId) {
      fetchVerificationDetails();
    }
  }, [verificationId]);

  const fetchVerificationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverService.getVerificationDetails(verificationId!);
      setVerificationDetail(response);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load verification details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewDialog = (document: Document, status: DocumentStatus) => {
    setSelectedDocument(document);
    setReviewStatus(status);
    setReviewNotes(status === 'approved' ? 'Document verified and approved' : '');
    setRejectionReason('');
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedDocument(null);
    setReviewNotes('');
    setRejectionReason('');
  };

  const handleSubmitReview = async () => {
    if (!selectedDocument) return;
    
    if (reviewStatus === 'rejected') {
      if (!reviewNotes.trim()) {
        toast.error('Please provide review notes for rejection');
        return;
      }
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const reviewData: any = {
        status: reviewStatus,
        review_notes: reviewNotes,
      };

      if (reviewStatus === 'rejected') {
        reviewData.rejection_reason = rejectionReason;
      }

      const response = await driverService.reviewDocument(selectedDocument.id, reviewData);
      
      toast.success(response.message || 'Document reviewed successfully');
      handleCloseReviewDialog();
      fetchVerificationDetails();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to submit review';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditDialog = (document: Document) => {
    setEditingDocument(document);
    setEditFormData({
      document_number: document.document_number || '',
      vehicle_model: document.vehicle_model || '',
      vehicle_color: document.vehicle_color || '',
            // @ts-ignore
      certification_number: document.certification_number || '',
            // @ts-ignore
      manufacture_year: document.manufacture_year || '',
            // @ts-ignore
      expiry_date: document.expiry_date || '',
    });
    setEditImage(null);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingDocument(null);
    setEditFormData({});
    setEditImage(null);
  };

  const handleSubmitEdit = async () => {
    if (!editingDocument) return;

    try {
      setSubmitting(true);

      const updateData: any = {};
      
      if (editImage) {
        updateData.document_image = editImage;
      }
      
      // Only include changed fields
      Object.keys(editFormData).forEach((key) => {
        if (editFormData[key] && editFormData[key] !== (editingDocument as any)[key]) {
          updateData[key] = editFormData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        handleCloseEditDialog();
        return;
      }

      await driverService.updateDocument(editingDocument.id, updateData);
      toast.success('Document updated successfully');
      handleCloseEditDialog();
      fetchVerificationDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await driverService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      fetchVerificationDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const getDocumentIcon = (documentType: string) => {
    const icons: Record<string, React.ReactNode> = {
      license_front: <FileText className="w-5 h-5" />,
      license_back: <FileText className="w-5 h-5" />,
      vehicle_photo: <Camera className="w-5 h-5" />,
      bill_book_front: <File className="w-5 h-5" />,
      bill_book_back: <File className="w-5 h-5" />,
      insurance_photo: <Shield className="w-5 h-5" />,
      nid_photo: <FileText className="w-5 h-5" />,
      profile_picture: <User className="w-5 h-5" />,
    };
    return icons[documentType] || <File className="w-5 h-5" />;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !verificationDetail) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        <button
          onClick={() => navigate('/driver-verification')}
          className="ml-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!verificationDetail) return null;

  const { driver, documents, verification } = verificationDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/driver-verification')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Document Verification
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review driver documents and approve or reject them
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(verification.status)} className="text-sm px-4 py-2">
          {verification.status}
        </Badge>
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <XCircle className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Avatar and Name */}
                <div className="text-center">
                  <Avatar.Root className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary">
                    <Avatar.Fallback className="text-white text-2xl font-semibold">
                      {driver.full_name.charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {driver.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {driver.role}
                  </p>
                  <div className="mt-2">
                    <Badge variant={getStatusBadgeVariant(driver.status)}>
                      {driver.status}
                    </Badge>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                        {driver.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {driver.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Driver ID
                      </dt>
                      <dd className="mt-1 text-xs text-gray-900 dark:text-white break-all font-mono">
                        {driver.id}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Registered
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {format(new Date(driver.created_at), 'MMM dd, yyyy HH:mm')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Submissions
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {verification.submission_count}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <div className="lg:col-span-2 space-y-4">
          {Array.isArray(documents) &&  documents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No documents submitted
                </p>
              </CardContent>
            </Card>
          ) : (
            Array.isArray(documents) && documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {getDocumentIcon(document.document_type)}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white uppercase">
                              {document.document_type.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {document.document_category}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(document.status)}>
                          {document.status}
                        </Badge>
                      </div>

                      <dl className="space-y-3">
                        {document.document_number && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Document Number
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                              {document.document_number}
                            </dd>
                          </div>
                        )}
                        {document.vehicle_model && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Vehicle Model
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                              {document.vehicle_model}
                            </dd>
                          </div>
                        )}
                        {document.vehicle_color && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Vehicle Color
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                              {document.vehicle_color}
                            </dd>
                          </div>
                        )}
            {/* @ts-ignore */}

                        {document.certification_number && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Certification Number
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {/* @ts-ignore */}

                              {document.certification_number}
                            </dd>
                          </div>
                        )}
            {/* @ts-ignore */}

                        {document.manufacture_year && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Manufacture Year
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {/* @ts-ignore */}
                              
                              {document.manufacture_year}
                            </dd>
                          </div>
                        )}
            {/* @ts-ignore */}
                        
                        {document.expiry_date && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Expiry Date
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {/* @ts-ignore */}
                              
                              {format(new Date(document.expiry_date), 'MMM dd, yyyy')}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Uploaded
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                            {format(new Date(document.uploaded_at), 'MMM dd, yyyy HH:mm')}
                          </dd>
                        </div>
                        {document.review_notes && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Review Notes
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                              {document.review_notes}
                            </dd>
                          </div>
                        )}
                        {document.rejection_reason && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Rejection Reason
                            </dt>
                            <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {document.rejection_reason}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Document Preview */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setImagePreview(driverService.getImageUrl(document.document_url))}
                        className="relative h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={driverService.getImageUrl(document.document_url)}
                          alt={document.document_type}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {document.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOpenReviewDialog(document, 'approved')}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenReviewDialog(document, 'rejected')}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {/* Admin Actions - Always visible */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditDialog(document)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          {/* <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog.Root open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {reviewStatus === 'approved' ? 'Approve Document' : 'Reject Document'}
            </Dialog.Title>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                reviewStatus === 'approved' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                <p className="text-sm">
                  You are about to {reviewStatus === 'approved' ? 'approve' : 'reject'} this document.
                  {reviewStatus === 'rejected' && ' Please provide detailed feedback.'}
                </p>
              </div>

              {/* Review Notes */}
              <div>
                <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes {reviewStatus === 'rejected' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="review-notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                  placeholder={
                    reviewStatus === 'approved'
                      ? 'Add any notes about the approval...'
                      : 'Document quality is poor'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Internal notes for your records
                </p>
              </div>

              {/* Rejection Reason - Only shown when rejecting */}
              {reviewStatus === 'rejected' && (
                <div>
                  <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="rejection-reason"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                    placeholder="Image is blurry and text is not readable. Please upload a clear photo."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This message will be shown to the driver. Be clear and specific about what needs to be fixed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseReviewDialog}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={
                  submitting || 
                  (reviewStatus === 'rejected' && (!reviewNotes.trim() || !rejectionReason.trim()))
                }
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  reviewStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {submitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Document Dialog */}
      <Dialog.Root open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Edit Document
            </Dialog.Title>

            <div className="space-y-4">
              {/* Current Image Preview */}
              {editingDocument && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Image
                  </label>
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={driverService.getImageUrl(editingDocument.document_url)}
                      alt="Current"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Replace Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                />
                {editImage && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    New image selected: {editImage.name}
                  </p>
                )}
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  value={editFormData.document_number || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, document_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                  placeholder="Enter document number"
                />
              </div>

              {/* Vehicle fields - conditional */}
              {editingDocument?.document_category === 'vehicle_certification' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      value={editFormData.vehicle_model || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, vehicle_model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                      placeholder="e.g., Toyota Corolla"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Color
                    </label>
                    <input
                      type="text"
                      value={editFormData.vehicle_color || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, vehicle_color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                      placeholder="e.g., White"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Certification Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.certification_number || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, certification_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                      placeholder="Registration certificate number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Manufacture Year
                    </label>
                    <input
                      type="text"
                      value={editFormData.manufacture_year || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, manufacture_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                      placeholder="e.g., 2020"
                    />
                  </div>
                </>
              )}

              {/* Expiry Date */}
            {/* @ts-ignore */}
              {editingDocument?.document_category !== 'profile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.expiry_date || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseEditDialog}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Image Preview Dialog */}
      <Dialog.Root open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90 z-50" onClick={() => setImagePreview(null)} />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-7xl w-full p-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Document preview"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default DocumentReview;