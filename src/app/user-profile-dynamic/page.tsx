// src/app/[username]/page.tsx
import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import ProfileTabs from '@/components/ProfileTabs';

async function fetchProfile(username: string) {
  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT id, username, full_name FROM users WHERE username = $1', [username]);
    const user = userRes.rows[0];
    if (!user) {
      return null;
    }
    const businessRes = await client.query(
      'SELECT * FROM businesses WHERE owner_id = $1', // Fetch all columns
      [user.id]
    );
    const business = businessRes.rows[0] || {
      name: 'Unnamed Business',
      description: 'No description',
      website: null,
      location: null,
      logo: null,
      background_image: null,
      contact_person_name: null,
    };
    return { user, business };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  } finally {
    client.release();
  }
}

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const profile = await fetchProfile(params.username);
  if (!profile) {
    notFound();
  }
  const { user, business } = profile;

  return <ProfileTabs user={user} business={business} />;
}