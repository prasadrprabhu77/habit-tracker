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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
    <div
      className={`w-full max-w-lg rounded-lg p-4 sm:p-6 border shadow-lg 
      overflow-y-auto max-h-[90vh]
      ${
        theme === "dark"
          ? "bg-gray-900 text-white border-gray-700"
          : "bg-white text-gray-900 border-gray-300"
      }`}
    >
      <h2 className="text-lg sm:text-xl md:text-2xl text-green-600 font-bold mb-4">
        {initialData ? "Update Habit" : "Add New Habit"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Habit Name */}
        <div>
          <label className="block mb-1 text-sm">Habit Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 text-sm rounded border ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-sm">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 text-sm rounded border resize-none ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
        </div>

        {/* Priority & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded border ${
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
            <label className="block mb-1 text-sm">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded border ${
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
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 text-sm">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded border ${
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

        {/* Reminder */}
        <div>
          <label className="block mb-1 text-sm">Reminder Time</label>
          <input
            type="time"
            name="reminderTime"
            value={formData.reminderTime}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded border ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm rounded ${
              theme === "dark"
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-gray-900"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`px-4 py-2 text-sm rounded ${
              theme === "dark"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
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
