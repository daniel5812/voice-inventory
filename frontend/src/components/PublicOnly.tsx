import { Navigate } from "react-router-dom";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  children: ReactNode;
}

export default function PublicOnly({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return null; // או Spinner
  }

  if (authed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
