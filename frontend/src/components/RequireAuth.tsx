import { Navigate } from "react-router-dom";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  children: ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // בדיקה ראשונית
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });

    // האזנה לשינויים (login / logout / refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthed(!!session);
        setLoading(false);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // אפשר להחליף ב-Spinner
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
