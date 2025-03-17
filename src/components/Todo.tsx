"use client";

import { useState } from 'react';

interface TodoProps {
  id: number;
  text: string;
  completed: boolean;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

export default function Todo({ id, text, completed, onDelete, onToggle, onEdit }: TodoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      onEdit(id, editText);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ذخیره
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          لغو
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg group">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
        className="w-5 h-5 rounded-full border-2 border-gray-300 focus:ring-blue-500"
      />
      <span className={`flex-1 ${completed ? 'line-through text-gray-400' : ''}`}>
        {text}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="invisible group-hover:visible px-2 py-1 text-gray-600 hover:text-blue-500 focus:outline-none"
      >
        ویرایش
      </button>
      <button
        onClick={() => onDelete(id)}
        className="invisible group-hover:visible px-2 py-1 text-gray-600 hover:text-red-500 focus:outline-none"
      >
        حذف
      </button>
    </div>
  );
} 