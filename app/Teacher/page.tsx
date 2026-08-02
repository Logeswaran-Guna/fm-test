'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AssignedRequirement, normalizeStatus } from './types';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TeacherDashboard() {
  const [requirements, setRequirements] = useState<AssignedRequirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Fetch assigned requirements from Supabase
  const fetchAssignedRequests = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequirements(data || []);
    } catch (err: any) {
      console.error('Error fetching requirements:', err);
      setErrorBanner(err.message || 'Failed to load assigned requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedRequests();
  }, []);

  // Action: Update status directly in Supabase
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI Update
    setRequirements((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );

    const { error } = await supabase
      .from('requirements')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Failed to update status:', error);
      setErrorBanner('Failed to update status on server. Reverting change.');
      fetchAssignedRequests(); // Revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Top Header Banner */}
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
            Instructor Portal
          </span>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        </div>
        <button
          onClick={fetchAssignedRequests}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
        >
          Refresh Data
        </button>
      </header>

      {/* Error Alert */}
      {errorBanner && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
          {errorBanner}
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-200">
            Assigned Student Matches & Demos
          </h2>
          <span className="text-xs text-slate-400">
            Total Requests: {requirements.length}
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            Loading assigned requests...
          </div>
        ) : requirements.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No matched requirements found at the moment.
          </div>
        ) : (
          /* List of Matched Parent Cards */
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.map((req) => {
              const currentStatus = normalizeStatus(req.status);

              // Standardized field mappings from Supabase schema
              const displayGrade = req.grade_class || 'N/A';
              const displaySubject = req.subjects_needed || 'N/A';
              const displayLocation = req.location_address || 'N/A';
              const displayPhone = req.phone_number || '';

              return (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-base text-slate-100 capitalize">
                          {req.student_name || 'Student'}{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            (Grade {displayGrade})
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 capitalize">
                          Parent: {req.parent_name}
                        </p>
                      </div>
                      {/* Status Badge */}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                          currentStatus === 'matched'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : currentStatus === 'demo scheduled'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : currentStatus === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <hr className="border-slate-800/60" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Subject:</span>
                        <span className="text-amber-300 font-medium capitalize">
                          {displaySubject}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Location:</span>
                        <span className="text-slate-300 capitalize">
                          {displayLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${displayPhone}`}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors text-center flex-1"
                    >
                      Call Parent
                    </a>

                    {currentStatus !== 'demo scheduled' && currentStatus !== 'completed' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(req.id, 'Demo Scheduled')
                        }
                        className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1.5 rounded transition-colors flex-1"
                      >
                        Confirm Demo Slot
                      </button>
                    )}

                    {currentStatus === 'demo scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'Completed')}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded transition-colors flex-1"
                      >
                        Mark Class Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}