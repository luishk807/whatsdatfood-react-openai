export const getRestaurantByName = async (name: string) => {
  const url: string | undefined = process.env.REACT_APP_BACKEND_URL;
  try {
    const resp = await fetch(
      `${url}/restaurants/find-match?restaurant=${name}&limit=10&page=1`,
    );
    const { data } = await resp.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
