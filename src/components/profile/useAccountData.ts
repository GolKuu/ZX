import { useCallback, useEffect, useState } from 'react';
import { loadAccountData } from '../../lib/accountApi';
import type { AccountData } from '../../lib/accountTypes';

export function useAccountData(userId: string) {
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setError('');
    try {
      setData(await loadAccountData(userId));
    } catch {
      setError('Не удалось загрузить профиль. Проверьте соединение.');
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, reload };
}
