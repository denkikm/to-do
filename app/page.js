'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error('Error fetching todos:', err));
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">لیست کارها</h1>
      <div className="space-y-4">
        {todos.map(todo => (
          <div key={todo._id} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl">{todo.title}</h2>
            <p className="text-gray-600">{todo.completed ? 'انجام شده' : 'در انتظار'}</p>
          </div>
        ))}
      </div>
    </main>
  );
} 