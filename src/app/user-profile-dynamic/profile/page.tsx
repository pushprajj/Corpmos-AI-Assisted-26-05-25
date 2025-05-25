'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BusinessDetails from '@/components/BusinessDetails';
import ProfileTabs from '@/components/ProfileTabs';
import { useRouter } from 'next/navigation';

type UserData = {
  id: string;
  name?: string;
  image?: string;
  full_name?: string;
  username?: string;
};

type BusinessData = {
  id: string;
  name?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  background_image?: string;
  contact_person_name?: string;
  logo?: string;
  tagline?: string;
  size?: string;
  founded_year?: string;
  hours?: string;
  contact_phone?: string;
  contact_email?: string;
  business_street?: string;
  business_city?: string;
  business_state?: string;
  business_zip_code?: string;
  business_country?: string;
};

export default function ProfilePage() {
  const { user: authUser, status } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && authUser) {
      // Fetch user and business data
      const fetchData = async () => {
        try {
          // Fetch user data
          const userResponse = await fetch(`/api/users/${authUser.id}`);
          if (!userResponse.ok) throw new Error('Failed to fetch user data');
          const userData = await userResponse.json();
          
          // Fetch business data
          const businessResponse = await fetch(`/api/business/${authUser.id}`);
          if (!businessResponse.ok) throw new Error('Failed to fetch business data');
          const businessData = await businessResponse.json();
          
          setUserData(userData);
          setBusinessData(businessData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile data:', error);
          setFetchError(error instanceof Error ? error.message : 'Failed to load profile data');
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [status, router, authUser]);

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="text-red-500">{fetchError}</div>
      </div>
    );
  }

  if (!userData || !businessData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="text-red-500">Unable to load profile data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 -mt-1">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-0 pb-1">
        <BusinessDetails userId={userData.id} />
        <ProfileTabs user={userData} business={businessData} />
      </div>
    </div>
  );
}