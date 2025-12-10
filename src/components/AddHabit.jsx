import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeProvider";
import { useAuth } from "../context/AuthProvider";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AddHabit = ({ onClose, onSave, initialData = null }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "Low",
    frequency: "Daily",
    startDate: "",
    endDate: "",
    category: "Spiritual",
    reminderTime: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to add a habit.");
      return;
    }

    try {
      const habitData = {
        ...formData,
        createdAt: initialData?.createdAt || serverTimestamp(),
        lastUpdate: serverTimestamp(),
      };

      const habitsRef = collection(db, "users", currentUser.uid, "habits");
      const docRef = await addDoc(habitsRef, habitData);

      onSave && onSave({ id: docRef.id, ...habitData });
      onClose();
    } catch (error) {
      console.error("Error saving habit:", error);
      alert("Failed to save habit.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div
        className={`w-full max-w-lg rounded-lg p-6 border shadow-lg overflow-y-auto max-h-[90vh] ${
          theme === "dark"
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl text-green-700 font-bold mb-4">
          {initialData ? "Update Habit" : "Add New Habit"}
        </h2>

        {/* ✅ Full form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Habit Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <option>Spiritual</option>
              <option>Health</option>
              <option>Work</option>
              <option>Personal</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Reminder Time</label>
            <input
              type="time"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                theme === "dark"
                  ? "bg-gray-600 text-white hover:bg-gray-500"
                  : "bg-gray-300 text-gray-900 hover:bg-gray-400"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded ${
                theme === "dark"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabit;
