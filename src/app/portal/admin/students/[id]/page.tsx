'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  User as UserIcon,
  BookOpen,
  Building,
  Download,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentProfilePage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const [student, setStudent]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error,   setError]         = useState('');
  const [exporting, setExporting]   = useState(false);
  const [exportMsg, setExportMsg]   = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/admin/students/${id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Student not found');
        }
        const data = await res.json();
        setStudent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  // ── Export handler ──────────────────────────────────────────────────────
  const handleExportTranscript = async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const res = await fetch(`/api/admin/students/${id}/transcript`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export failed');
      }

      // Stream the blob directly to the browser as a file download
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      // Derive filename from Content-Disposition header (or fall back)
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match       = disposition.match(/filename="([^"]+)"/);
      const filename    = match ? match[1] : `Transcript_${student?.name?.replace(/\s+/g, '_') ?? id}.pdf`;

      const link    = document.createElement('a');
      link.href     = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMsg('✅ Transcript downloaded successfully.');
    } catch (err: any) {
      setExportMsg(`❌ ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
        <div className="text-center p-8 bg-white rounded-lg border border-red-200">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">{error || 'Student not found'}</p>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>

        {/* Export Transcript button */}
        <Button
          id="btn-export-transcript"
          onClick={handleExportTranscript}
          disabled={exporting}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? 'Generating PDF…' : 'Export Transcript'}
        </Button>
      </div>

      {/* Export status message */}
      {exportMsg && (
        <p className={`text-sm font-medium ${exportMsg.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
          {exportMsg}
        </p>
      )}

      {/* ── Student Card ── */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 border-b pb-6 mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <UserIcon className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-gray-500">Student ID: {student._id}</p>
            <p className="text-gray-500">{student.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Academic Info
            </h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{student.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{student.department?.name || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-medium text-green-600">
                  {student.forcePasswordChange ? 'Pending Setup' : 'Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Personal Details
            </h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <div>
                <p className="text-sm text-gray-500">National ID</p>
                <p className="font-medium">{student.nationalId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined Nexus</p>
                <p className="font-medium">{new Date(student.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Profile Update</p>
                <p className="font-medium">{new Date(student.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript notice */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Official Transcript Export</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Click <strong>Export Transcript</strong> to generate a read-only, password-protected PDF bearing the
              university letterhead, an "OFFICIAL TRANSCRIPT" watermark, a unique document ID, and an issue
              timestamp. The PDF cannot be edited or copied without the owner password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
