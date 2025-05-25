import { Card } from "antd";

const Notes = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      <Card className="bg-white">
        <p className="text-gray-600">Your notes will appear here.</p>
      </Card>
    </div>
  );
};

export default Notes;
