"use client";

import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiFlag, FiTrash2, FiEdit2, FiCheck, FiX, FiPlus, FiSearch, FiTag, FiBell, FiFilter, FiShare2 } from 'react-icons/fi';

interface TodoListProps {
  userId: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
  tags: string[];
  reminder?: string;
  createdAt: number;
  updatedAt: number;
}

interface TodoStats {
  total: number;
  completed: number;
  upcoming: number;
  overdue: number;
}

export default function TodoList({ userId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming' | 'overdue'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoDetails, setNewTodoDetails] = useState<Partial<Todo>>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: '',
    tags: [],
    reminder: ''
  });

  // Load todos from API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`/api/todos?userId=${userId}`);
        if (!response.ok) throw new Error('خطا در دریافت کارها');
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'خطا در دریافت کارها');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [userId]);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.reminder && !todo.completed) {
          const reminderTime = new Date(todo.reminder);
          if (reminderTime.getTime() - now.getTime() <= 300000 && reminderTime.getTime() > now.getTime()) { // 5 minutes before
            if (Notification.permission === 'granted') {
              new Notification('یادآوری کار', {
                body: todo.title,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [todos]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addTodo = async () => {
    if (!newTodoDetails.title?.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTodoDetails,
          userId
        }),
      });

      if (!response.ok) throw new Error('خطا در افزودن کار جدید');

      const newTodo = await response.json();
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoDetails({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        category: '',
        tags: [],
        reminder: ''
      });
      setShowAddForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در افزودن کار جدید');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !todo.completed
        }),
      });

      if (!response.ok) throw new Error('خطا در تغییر وضعیت کار');

      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در تغییر وضعیت کار');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این کار را حذف کنید؟')) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('خطا در حذف کار');

      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در حذف کار');
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('خطا در به‌روزرسانی کار');

      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, ...updates, updatedAt: Date.now() } : todo
        )
      );
      setEditingId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطا در به‌روزرسانی کار');
    }
  };

  const getStats = (): TodoStats => {
    const now = new Date();
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      upcoming: todos.filter(t => t.dueDate && new Date(t.dueDate) > now && !t.completed).length,
      overdue: todos.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed).length
    };
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    todos.forEach(todo => todo.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  };

  const getAllCategories = () => {
    const categories = new Set<string>();
    todos.forEach(todo => todo.category && categories.add(todo.category));
    return Array.from(categories);
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      // Filter by status
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      if (filter === 'upcoming') return todo.dueDate && new Date(todo.dueDate) > new Date() && !todo.completed;
      if (filter === 'overdue') return todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
      return true;
    })
    .filter(todo => {
      // Filter by search
      const searchLower = searchTerm.toLowerCase();
      return (
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description?.toLowerCase().includes(searchLower) ||
        todo.category?.toLowerCase().includes(searchLower) ||
        todo.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .filter(todo => {
      // Filter by selected tags
      if (selectedTags.length === 0) return true;
      return selectedTags.every(tag => todo.tags?.includes(tag));
    })
    .sort((a, b) => {
      // Sort todos
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return sortOrder === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortOrder === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return sortOrder === 'asc'
        ? a.createdAt - b.createdAt
        : b.createdAt - a.createdAt;
    });

  const getPriorityColor = (priority: string) => {
    if (document.body.classList.contains('cat-mode')) {
      switch (priority) {
        case 'high': return 'text-pink-500';
        case 'medium': return 'text-purple-400';
        case 'low': return 'text-pink-300';
        default: return 'text-gray-500';
      }
    }
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const shareTodo = (todo: Todo) => {
    const text = `
عنوان: ${todo.title}
${todo.description ? `توضیحات: ${todo.description}` : ''}
${todo.dueDate ? `تاریخ سررسید: ${new Date(todo.dueDate).toLocaleDateString('fa-IR')}` : ''}
اولویت: ${todo.priority}
${todo.category ? `دسته‌بندی: ${todo.category}` : ''}
${todo.tags?.length ? `برچسب‌ها: ${todo.tags.join(', ')}` : ''}
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'اشتراک‌گذاری کار',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('متن کار در کلیپ‌بورد کپی شد.');
    }
  };

  const stats = getStats();
  const allTags = getAllTags();
  const allCategories = getAllCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لیست کارها</h1>
              {showStats && (
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="font-medium">کل:</span> {stats.total}
                  </span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <span className="font-medium">تکمیل شده:</span> {stats.completed}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="font-medium">در پیش رو:</span> {stats.upcoming}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <span className="font-medium">گذشته:</span> {stats.overdue}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="cat-mode:bg-pink-400 cat-mode:hover:bg-pink-500 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>افزودن کار جدید</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="جستجو در کارها..."
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'createdAt' | 'dueDate' | 'priority')}
                className="px-3 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">تاریخ ایجاد</option>
                <option value="dueDate">تاریخ سررسید</option>
                <option value="priority">اولویت</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {sortOrder === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  )}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  } hover:opacity-90 transition-colors`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
            {(['all', 'active', 'completed', 'upcoming', 'overdue'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filter === filterType
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filterType === 'all' && 'همه'}
                {filterType === 'active' && 'فعال'}
                {filterType === 'completed' && 'تکمیل شده'}
                {filterType === 'upcoming' && 'در پیش رو'}
                {filterType === 'overdue' && 'گذشته'}
              </button>
            ))}
          </div>

          {/* Add Todo Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 space-y-4 border border-gray-100 dark:border-gray-600">
              <input
                type="text"
                value={newTodoDetails.title}
                onChange={e => setNewTodoDetails(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان کار..."
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                value={newTodoDetails.description}
                onChange={e => setNewTodoDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="توضیحات..."
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 h-24"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="date"
                  value={newTodoDetails.dueDate}
                  onChange={e => setNewTodoDetails(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="datetime-local"
                  value={newTodoDetails.reminder}
                  onChange={e => setNewTodoDetails(prev => ({ ...prev, reminder: e.target.value }))}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="یادآوری"
                />
                <select
                  value={newTodoDetails.priority}
                  onChange={e => setNewTodoDetails(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">اولویت کم</option>
                  <option value="medium">اولویت متوسط</option>
                  <option value="high">اولویت بالا</option>
                </select>
                <input
                  type="text"
                  value={newTodoDetails.category}
                  onChange={e => setNewTodoDetails(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="دسته‌بندی..."
                  list="categories"
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
                <datalist id="categories">
                  {allCategories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="برچسب‌ها (با کاما جدا کنید)"
                  className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const tag = input.value.trim();
                      if (tag && !newTodoDetails.tags?.includes(tag)) {
                        setNewTodoDetails(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), tag]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
              {newTodoDetails.tags && newTodoDetails.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTodoDetails.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => setNewTodoDetails(prev => ({
                          ...prev,
                          tags: prev.tags?.filter(t => t !== tag) || []
                        }))}
                        className="hover:text-red-500"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={addTodo}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  افزودن
                </button>
              </div>
            </div>
          )}

          {/* Stats Section */}
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="cat-mode:bg-pink-100 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="text-2xl font-bold cat-mode:text-pink-600 text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-sm cat-mode:text-pink-500 text-gray-500">کل کارها</div>
              </div>
              <div className="cat-mode:bg-purple-100 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="text-2xl font-bold cat-mode:text-purple-600 text-gray-900 dark:text-white">{stats.completed}</div>
                <div className="text-sm cat-mode:text-purple-500 text-gray-500">تکمیل شده</div>
              </div>
              <div className="cat-mode:bg-pink-100 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="text-2xl font-bold cat-mode:text-pink-600 text-gray-900 dark:text-white">{stats.upcoming}</div>
                <div className="text-sm cat-mode:text-pink-500 text-gray-500">پیش رو</div>
              </div>
              <div className="cat-mode:bg-purple-100 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="text-2xl font-bold cat-mode:text-purple-600 text-gray-900 dark:text-white">{stats.overdue}</div>
                <div className="text-sm cat-mode:text-purple-500 text-gray-500">گذشته</div>
              </div>
            </div>
          )}

          {/* Todo List */}
          <div className="space-y-4">
            {filteredAndSortedTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                موردی برای نمایش وجود ندارد.
              </div>
            ) : (
              filteredAndSortedTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`cat-mode:bg-gradient-to-r cat-mode:from-pink-50 cat-mode:to-purple-50 
                    cat-mode:dark:from-pink-900/50 cat-mode:dark:to-purple-900/50
                    bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all duration-300
                    ${todo.completed ? 'opacity-75' : 'opacity-100'}
                    hover:shadow-md transform hover:-translate-y-1`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`cat-mode:hover:bg-pink-200 hover:bg-gray-100 rounded-full p-2 transition-colors
                        ${todo.completed ? 'cat-mode:text-pink-500 text-green-500' : 'text-gray-400'}`}
                    >
                      {todo.completed ? <FiCheck className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 cat-mode:border-pink-300 border-gray-300" />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through cat-mode:text-pink-400 text-gray-500' : 'cat-mode:text-gray-800 text-gray-900'}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="mt-1 text-sm cat-mode:text-gray-600 text-gray-500">{todo.description}</p>
                      )}
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {todo.dueDate && (
                          <span className="inline-flex items-center text-sm cat-mode:text-pink-500 text-gray-500">
                            <FiCalendar className="mr-1 w-4 h-4" />
                            {new Date(todo.dueDate).toLocaleDateString('fa-IR')}
                          </span>
                        )}
                        
                        {todo.priority && (
                          <span className={`inline-flex items-center text-sm ${getPriorityColor(todo.priority)}`}>
                            <FiFlag className="mr-1 w-4 h-4" />
                            {todo.priority === 'high' ? 'مهم' : todo.priority === 'medium' ? 'متوسط' : 'کم'}
                          </span>
                        )}
                        
                        {todo.tags?.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center text-sm cat-mode:bg-pink-100 cat-mode:text-pink-600 
                              bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            <FiTag className="mr-1 w-4 h-4" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(todo.id)}
                        className="cat-mode:hover:bg-pink-100 hover:bg-gray-100 p-2 rounded-full transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 cat-mode:text-pink-500 text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="cat-mode:hover:bg-pink-100 hover:bg-gray-100 p-2 rounded-full transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 cat-mode:text-pink-500 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 