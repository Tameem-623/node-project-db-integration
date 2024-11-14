import React, { useEffect, useState } from "react";
import CRUDManager from "./components/CRUDManager";

const API_BASE_URL = "http://localhost:3001";

function App() {
  const [items, setItems] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      console.log(data);
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD Application</h1>
      <CRUDManager />
    </div>
  );
}

export default App;
