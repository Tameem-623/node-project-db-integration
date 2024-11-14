const API_BASE_URL = "http://localhost:3001";

export const fetchItems = async () => {
  const response = await fetch(`${API_BASE_URL}/read`);
  if (!response.ok) throw new Error("Failed to fetch items");
  return response.json();
};

export const createItem = async (data) => {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create item");
  return response.json();
};

export const updateItem = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update item");
  return response.json();
};

export const deleteItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete item");
  return true;
};
