import { useState } from "react";

export default function ReportSafety() {
  const [formData, setFormData] = useState({
    accommodationName: "",
    issueType: "",
    description: "",
  });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") // ⭐ Add auth token
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      alert(data.message || "Report submitted");
    } catch (err) {
      alert("Error submitting report");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Report Safety Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="accommodationName"
          placeholder="Accommodation Name"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="issueType"
          placeholder="Issue Type (Food / Water / Security)"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Describe the issue"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
