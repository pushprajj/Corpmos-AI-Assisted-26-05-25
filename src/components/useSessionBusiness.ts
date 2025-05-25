import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface SessionBusiness {
  id: string;
  name?: string;
  logo?: string;
}

export function useSessionBusiness(): SessionBusiness | null {
  const { data: session } = useSession();
  const [business, setBusiness] = useState<SessionBusiness | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/business/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness({ id: data.id, name: data.name, logo: data.logo });
        }
      } catch (e) {
        setBusiness(null);
      }
    }
    fetchBusiness();
  }, [session?.user?.id]);

  return business;
}
