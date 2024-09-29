export const fetchData = async <T>(
  url: string,
  method: string = 'GET',
  data?: any,
  token?: string
): Promise<T> => {
  const headers: HeadersInit = {
    ...(token && {Authorization: `Bearer ${token}`}),
  };

  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method,
    headers,
    ...(data && {
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }

  return response.json();
};
