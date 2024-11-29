import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface NewJob {
  title: string;
  description: string;
  salary: string;
}

interface ApplicationForm {
  experience: string;
  skills: string;
  coverLetter: string;
}

// Mock data storage for development
let MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior React Developer',
    description: 'We are looking for a senior React developer to join our team...',
    salary: '$120k - $150k',
    createdAt: new Date(),
    applications: 12
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    description: 'Join our fast-growing startup as a full stack developer...',
    salary: '$100k - $130k',
    createdAt: new Date(Date.now() - 86400000),
    applications: 8
  }
];

export async function getJobs() {
  try {
    if (process.env.NODE_ENV === 'development') {
      return MOCK_JOBS;
    }

    const jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(jobsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return MOCK_JOBS;
  }
}

export async function createJob(job: NewJob) {
  try {
    if (process.env.NODE_ENV === 'development') {
      const newJob = {
        id: Date.now().toString(),
        ...job,
        createdAt: new Date(),
        applications: 0
      };
      MOCK_JOBS = [newJob, ...MOCK_JOBS];
      return newJob;
    }

    const docRef = await addDoc(collection(db, 'jobs'), {
      ...job,
      createdAt: serverTimestamp(),
      applications: 0
    });
    
    return docRef;
  } catch (error) {
    console.error('Error creating job:', error);
    throw new Error('Failed to create job');
  }
}

export async function applyForJob(jobId: string, application: ApplicationForm) {
  try {
    if (process.env.NODE_ENV === 'development') {
      MOCK_JOBS = MOCK_JOBS.map(job => 
        job.id === jobId 
          ? { ...job, applications: job.applications + 1 }
          : job
      );
      console.log('Application submitted:', application);
      return true;
    }

    const jobRef = doc(db, 'jobs', jobId);
    
    // Create application document
    await addDoc(collection(db, 'applications'), {
      jobId,
      ...application,
      userId: 'temp-user-id', // Replace with actual user ID
      status: 'pending',
      createdAt: serverTimestamp()
    });

    // Increment application count
    await updateDoc(jobRef, {
      applications: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error applying for job:', error);
    throw new Error('Failed to apply for job');
  }
}