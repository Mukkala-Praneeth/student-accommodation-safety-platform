import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportSafety() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accommodationName: "",
    issueType: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== FORM SUBMIT ===");
    console.log("formData:", formData);

    const token = localStorage.getItem("token");
    console.log("token exists:", !!token);

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        alert("Report submitted successfully!");
        setFormData({
          accommodationName: "",
          issueType: "",
          description: "",
        });
        navigate("/my-reports");
      } else {
        alert(data.message || "Failed to submit report");
      }
    } catch (err) {
      console.log("Error:", err);
      alert("Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Report Safety Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Accommodation Name</label>
          <input
            name="accommodationName"
            value={formData.accommodationName}
            placeholder="Enter accommodation name"
            className="border p-2 w-full rounded"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Issue Type</label>
          <select
            name="issueType"
            value={formData.issueType}
            className="border p-2 w-full rounded"
            onChange={handleChange}
            required
          >
            <option value="">Select issue type</option>
            <option value="Food Safety">Food Safety</option>
            <option value="Water Quality">Water Quality</option>
            <option value="Hygiene">Hygiene</option>
            <option value="Security">Security</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            placeholder="Describe the issue in detail"
            className="border p-2 w-full rounded"
            rows={4}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
