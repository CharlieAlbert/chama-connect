import MinutesTable from "./MinutesTable";

export default function MinutesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meeting Minutes</h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <MinutesTable />
      </div>
    </div>
  );
}
