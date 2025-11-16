import React, { useEffect, useState } from "react";
import { Clock, ToggleLeft, ToggleRight, Save, Loader2, List } from "lucide-react";

interface SlotSettings {
  globalEnabled: boolean;
  defaultAmount: number;
  slotsPerDay: string[];
}

const SlotSettings: React.FC = () => {
  const [settings, setSettings] = useState<SlotSettings>({
    globalEnabled: true,
    defaultAmount: 0,
    slotsPerDay: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState("");

  const BASE_URL = "https://soccerzone-backend.onrender.com/api/slots";

  /** 🔹 Fetch Settings */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing authentication token");

        const res = await fetch(`${BASE_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch slot settings");

        const data = await res.json();
        setSettings({
          globalEnabled: data.globalEnabled,
          defaultAmount: data.defaultAmount,
          slotsPerDay: data.slotsPerDay || [],
        });
      } catch (err: any) {
        setMessage(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  /** 🔹 Input change */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "defaultAmount"
          ? Number(value)
          : value,
    }));
  };

  /** 🔹 Add slot (PATCH /settings/add-time/:time) */
  const handleAddSlot = async () => {
    if (!newSlot.trim()) return;
    const token = localStorage.getItem("token");

    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/settings/add-time/${newSlot.trim()}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to add slot time");

      setSettings((prev) => ({
        ...prev,
        slotsPerDay: [...prev.slotsPerDay, newSlot.trim()],
      }));
      setNewSlot("");
      setMessage("✅ Slot time added!");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /** 🔹 Remove slot (PATCH /settings/remove-time/:time) */
  const handleRemoveSlot = async (slot: string) => {
    const token = localStorage.getItem("token");

    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/settings/remove-time/${slot}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove slot");

      setSettings((prev) => ({
        ...prev,
        slotsPerDay: prev.slotsPerDay.filter((s) => s !== slot),
      }));
      setMessage("✅ Slot removed!");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /** 🔹 Save main settings (PATCH /settings) */
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`${BASE_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          globalEnabled: settings.globalEnabled,
          defaultAmount: settings.defaultAmount,
        }),
      });
      if (!res.ok) throw new Error("Failed to save slot settings");

      setMessage("✅ Slot settings saved successfully!");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /** 🔹 Loading state */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        <p className="mt-4 text-slate-600 font-medium">
          Loading slot settings...
        </p>
      </div>
    );
  }

  /** 🔹 UI */
  return (
    <section className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Slot Settings</h1>
      <p className="text-slate-600 mb-10">
        Manage system-wide slot configuration, pricing, and active status.
      </p>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md text-sm font-medium ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-8 bg-white shadow-md rounded-lg p-8 border border-slate-200">
        {/* Global Enabled */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium text-slate-700 flex items-center gap-2">
            {settings.globalEnabled ? (
              <ToggleRight className="w-6 h-6 text-green-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
            Enable Global Slots
          </label>
          <input
            type="checkbox"
            name="globalEnabled"
            checked={settings.globalEnabled}
            onChange={handleChange}
            className="h-5 w-5 text-green-600 border-gray-300 rounded"
          />
        </div>

        {/* Default Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Default Slot Price (₦)
          </label>
          <div className="relative">
            <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              name="defaultAmount"
              value={settings.defaultAmount}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Enter default amount"
            />
          </div>
        </div>

        {/* Slots Per Day */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Slot Times (per day)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="flex-1 border border-slate-300 rounded-md px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button
              onClick={handleAddSlot}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
            >
              Add
            </button>
          </div>

          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-md">
            {settings.slotsPerDay.map((slot, i) => (
              <li
                key={i}
                className="flex justify-between items-center px-4 py-2 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <List className="w-4 h-4 text-green-500" />
                  {slot}
                </div>
                <button
                  onClick={() => handleRemoveSlot(slot)}
                  disabled={saving}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
            {settings.slotsPerDay.length === 0 && (
              <li className="px-4 py-3 text-slate-500 text-sm text-center">
                No slots added yet.
              </li>
            )}
          </ul>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-white ${
              saving
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SlotSettings;