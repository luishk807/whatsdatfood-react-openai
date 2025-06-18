export const getRestaurantByName = async (name: string) => {
  const url: string | undefined = process.env.REACT_APP_BACKEND_URL;
  try {
    const resp = await fetch(
      `${url}/open-ai/get-restaurant-list?restaurant=${name}&limit=10&page=1`,
    );
    console.log(resp);
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
