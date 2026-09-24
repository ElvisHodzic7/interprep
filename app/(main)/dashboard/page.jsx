// app/dashboard/page.jsx
import React from "react";
import Banner from "./_components/Banner";
import CreateOptions from "./_components/CreateOptions";
import WelcomeContainer from "./_components/WelcomeContainer";

export default function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <WelcomeContainer />
        <Banner />
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl">Brze akcije</h2>
        </div>
        <CreateOptions />
      </div>
    </div>
  );
}
