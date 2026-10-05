import { useEffect, useState } from "react";

export default function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    setData(null);
    setError(null);
    fn().then(setData).catch((e) => setError(e.message));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error };
}
