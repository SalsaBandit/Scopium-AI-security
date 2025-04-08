import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComplianceDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Top Section: Summary Cards & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <h2 className="text-xl font-semibold">Total Reports</h2>
              <p className="text-2xl mt-2">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h2 className="text-xl font-semibold">Compliant Reports</h2>
              <p className="text-2xl mt-2">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h2 className="text-xl font-semibold">HIPAA Docs</h2>
              <p className="text-2xl mt-2">2</p>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart Placeholder */}
        <Card className="flex items-center justify-center h-full">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">Compliance Overview</h2>
            <div className="w-60 h-60 bg-white rounded-full shadow-inner flex items-center justify-center">
              <span className="text-gray-400">[Pie Chart]</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Report Submission Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Submit New Compliance Report</h2>
          <div className="space-y-2">
            <label className="block font-medium">Date</label>
            <input type="date" className="w-full p-2 border rounded" />
          </div>
          <div className="space-y-2">
            <label className="block font-medium">Category</label>
            <select className="w-full p-2 border rounded">
              <option>HIPAA</option>
              <option>GDPR</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block font-medium">File Upload</label>
            <input type="file" className="w-full" />
          </div>
          <Button>Submit Report</Button>
        </CardContent>
      </Card>

      {/* Bottom Section: Reports Table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Compliance Reports</h2>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white even:bg-gray-100">
                <td className="p-2">2025-03-01</td>
                <td className="p-2">HIPAA</td>
                <td className="p-2">Compliant</td>
              </tr>
              <tr className="odd:bg-white even:bg-gray-100">
                <td className="p-2">2025-02-15</td>
                <td className="p-2">HIPAA</td>
                <td className="p-2">Compliant</td>
              </tr>
              <tr className="odd:bg-white even:bg-gray-100">
                <td className="p-2">2025-02-01</td>
                <td className="p-2">HIPAA</td>
                <td className="p-2">Non-Compliant</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
