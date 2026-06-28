import type { AxiosResponse } from 'axios';
import { useState } from 'react';

export function useApiSubmit<T = any>(apiCall: () => Promise<AxiosResponse<T>>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (): Promise<T | null> => {
    setIsSubmitting(true);
    try {
      const response = await apiCall();
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
}