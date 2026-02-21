const BASE_URL = "https://jsonplaceholder.typicode.com/todos";

// GET todos
export const getTodos = async () => {
  const res = await fetch(`${BASE_URL}?_limit=10`);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

// CREATE todo
export const createTodo = async (todo) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return res.json();
};

// UPDATE todo
export const updateTodo = async (id, todo) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return res.json();
};

// DELETE todo
export const deleteTodo = async (id) => {
  await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
};
