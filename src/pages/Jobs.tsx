import React, { useState, useEffect } from 'react';
import { Briefcase, X, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getJobs, createJob, applyForJob } from '../services/jobService';
import LoadingSpinner from '../components/LoadingSpinner';

interface Job {
  id: string;
  title: string;
  description: string;
  salary: string;
  createdAt: Date;
}

interface ApplicationForm {
  experience: string;
  skills: string;
  coverLetter: string;
}

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    experience: '',
    skills: '',
    coverLetter: ''
  });
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    salary: ''
  });

  const loadJobs = async () => {
    try {
      const fetchedJobs = await getJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(newJob);
      toast.success('Job posted successfully!');
      setIsPostingJob(false);
      setNewJob({ title: '', description: '', salary: '' });
      loadJobs();
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsApplying(true);
    try {
      await applyForJob(selectedJob.id, applicationForm);
      toast.success('Application submitted successfully!');
      setSelectedJob(null);
      setApplicationForm({
        experience: '',
        skills: '',
        coverLetter: ''
      });
      loadJobs();
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 text-transparent bg-clip-text">
          Developer Jobs
        </h1>
        <button
          onClick={() => setIsPostingJob(true)}
          className="px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          Post Job
        </button>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-cyan-300/70">
            No jobs posted yet. Be the first to post a job!
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <h3 className="text-lg font-semibold text-cyan-100 mb-2">{job.title}</h3>
              <p className="text-cyan-300/70 mb-3 line-clamp-2">{job.description}</p>
              <div className="flex items-center text-cyan-300/70">
                <DollarSign className="w-4 h-4 mr-1" />
                {job.salary}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Posting Modal */}
      {isPostingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
          <div className="relative w-full max-w-md mx-auto my-8 px-4">
            <div className="bg-gray-900 rounded-lg shadow-xl">
              <div className="p-6">
                <button
                  onClick={() => setIsPostingJob(false)}
                  className="absolute right-6 top-6 text-cyan-400 hover:text-cyan-300"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-cyan-100 mb-6">Post a New Job</h2>

                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-1">Budget</label>
                    <input
                      type="text"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100"
                      placeholder="e.g. $500-$1000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-1">Description</label>
                    <textarea
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 h-32 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors"
                  >
                    Post Job
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
          <div className="relative w-full max-w-2xl mx-auto my-8 px-4">
            <div className="bg-gray-900 rounded-lg shadow-xl">
              <div className="p-6">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="absolute right-6 top-6 text-cyan-400 hover:text-cyan-300"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-cyan-100 mb-4">{selectedJob.title}</h2>
                
                <div className="flex items-center text-cyan-300/70 mb-4">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {selectedJob.salary}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-cyan-100 mb-2">Job Description</h3>
                  <p className="text-cyan-300/70 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-1">
                      Professional Experience
                    </label>
                    <textarea
                      value={applicationForm.experience}
                      onChange={(e) => setApplicationForm({ ...applicationForm, experience: e.target.value })}
                      placeholder="Describe your relevant work experience..."
                      className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-1">
                      Skills & Technologies
                    </label>
                    <textarea
                      value={applicationForm.skills}
                      onChange={(e) => setApplicationForm({ ...applicationForm, skills: e.target.value })}
                      placeholder="List your technical skills and proficiencies..."
                      className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-1">
                      Why are you a good fit?
                    </label>
                    <textarea
                      value={applicationForm.coverLetter}
                      onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                      placeholder="Tell us why you're excited about this role and what makes you a great candidate..."
                      className="w-full px-4 py-2 bg-white/5 border border-cyan-500/20 rounded-lg text-cyan-100 h-32 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isApplying}
                    className="w-full px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isApplying ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;