import DonorSidebar from "./DonorSidebar";

export default function DonorLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <DonorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}