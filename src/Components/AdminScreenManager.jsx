import { useState, useEffect } from "react";
import { addScreen, deleteScreen, getScreensByTheater } from "../api";
import { useData } from "../context/DataContext";

const AdminScreenManager = () => {
  const { theaters } = useData();
  const [screens, setScreens] = useState([]);
  const [screenForm, setScreenForm] = useState({
    name: "",
    screenType: "REGULAR",
    theaterId: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingScreens, setFetchingScreens] = useState(false);

  const fetchCurrentScreens = async () => {
    if (!screenForm.theaterId) {
      setScreens([]);
      return;
    }
    setFetchingScreens(true);
    try {
      const res = await getScreensByTheater(screenForm.theaterId);
      setScreens(res.data);
    } catch (err) {
      console.error("Failed to load screens:", err);
      setScreens([]);
    } finally {
      setFetchingScreens(false);
    }
  };

  useEffect(() => {
    fetchCurrentScreens();
  }, [screenForm.theaterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenForm.theaterId) return alert("Please select a theater!");

    setLoading(true);
    try {
      await addScreen(screenForm);
      alert(`Screen "${screenForm.name}" added successfully!`);
      setScreenForm((prev) => ({ ...prev, name: "" }));
      await fetchCurrentScreens();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error adding screen.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this screen? This will remove all associated seats.")) return;
    try {
      await deleteScreen(id);
      setScreens((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Delete failed. Ensure no shows are currently scheduled for this screen.");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-10 text-gray-900 border-l-8 border-[#DC143C] pl-4 uppercase tracking-tighter">
        Screen <span className="text-[#DC143C]">Configuration</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT: ADD SCREEN FORM */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-base md:text-lg font-bold text-gray-700 uppercase tracking-widest">
            Register New Screen
          </h3>
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-5 md:space-y-6"
          >
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                1. Select Theater
              </label>
              <select
                className="w-full p-4 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-red-100 focus:border-[#DC143C] font-bold text-sm"
                value={screenForm.theaterId}
                onChange={(e) =>
                  setScreenForm({ ...screenForm, theaterId: e.target.value })
                }
                required
              >
                <option value="">-- Choose a Theater --</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                2. Screen Details
              </label>
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="e.g. Audi 1"
                  className="p-4 border rounded-xl bg-white outline-none focus:border-[#DC143C] text-sm"
                  value={screenForm.name}
                  onChange={(e) =>
                    setScreenForm({ ...screenForm, name: e.target.value })
                  }
                  required
                />
                <select
                  className="p-4 border rounded-xl bg-white outline-none focus:border-[#DC143C] font-bold text-sm"
                  value={screenForm.screenType}
                  onChange={(e) =>
                    setScreenForm({ ...screenForm, screenType: e.target.value })
                  }
                >
                  <option value="REGULAR">REGULAR</option>
                  <option value="IMAX">IMAX</option>
                  <option value="3D">3D</option>
                  <option value="GOLD">GOLD CLASS</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DC143C] text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:bg-gray-300"
            >
              {loading ? "Registering..." : "Add Screen to Theater"}
            </button>
          </form>
        </div>

        {/* RIGHT: LIST OF EXISTING SCREENS */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-base md:text-lg font-bold text-gray-700 uppercase tracking-widest">
            Available Screens
          </h3>
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden shadow-sm min-h-[300px] md:min-h-[400px]">
            {screenForm.theaterId ? (
              fetchingScreens ? (
                <div className="p-10 md:p-20 text-center animate-pulse text-gray-400 font-bold">
                  Fetching screens...
                </div>
              ) : screens.length > 0 ? (
                <div className="divide-y">
                  {screens.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 md:p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-black text-gray-900 text-sm md:text-base">{s.name}</div>
                        <span className="text-[9px] md:text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold text-gray-600 uppercase">
                          {s.screenType}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-500 hover:text-red-700 text-[10px] md:text-xs font-bold uppercase tracking-tighter p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 md:p-20 text-center text-gray-400 text-sm">
                  No screens found in this theater.
                </div>
              )
            ) : (
              <div className="p-10 md:p-20 text-center text-gray-300 italic text-sm">
                Select a theater on the left to view and manage screens.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScreenManager;