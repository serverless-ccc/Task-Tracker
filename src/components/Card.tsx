import { useState } from "react";
import { Clock, Menu, Pencil, Trash } from "lucide-react";
import { Button, Popconfirm } from "antd";

export interface CardData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  date: string;
  isForAWeek: boolean;
  priority: string;
  userId: string;
  employeeId: string;
}

export default function TrelloCard({
  cardData,
  handleDelete,
}: {
  cardData: CardData;
  handleDelete: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Using the exact data provided
  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Determine label color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Clean description text (remove markdown and limit to 2 lines)
  const cleanDescription = cardData.description.replace(/\*\*/g, "");

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className="bg-white rounded-md shadow-md w-64 p-3 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Edit Menu Button */}
        {isHovered && (
          <div className="absolute top-2 right-2">
            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100">
              <Menu size={16} />
            </button>
          </div>
        )}

        {/* Priority and Status as Labels */}
        <div className="flex flex-wrap gap-1 mb-2">
          <div
            className={`${getPriorityColor(
              cardData.priority
            )} text-xs text-white px-2 py-1 rounded-md font-medium`}
          >
            {cardData.priority}
          </div>

          <Button type="primary" size="small" className="!ml-auto">
            <Pencil size={12} />
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this todo?"
            onConfirm={handleDelete}
          >
            <Button type="default" size="small">
              <Trash size={12} />
            </Button>
          </Popconfirm>
        </div>

        {/* Card Title */}
        <h3 className="font-medium text-gray-800 mb-2">{cardData.title}</h3>

        {/* Card Description - Limited to 2 lines */}
        <p className="text-sm text-gray-600 mb-3 overflow-hidden line-clamp-2">
          {cleanDescription}
        </p>

        {/* Card Footer */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>{formatDate(cardData.date)}</span>
          </div>
          <div className="text-xs text-gray-500">ID: {cardData.employeeId}</div>
        </div>
      </div>
    </div>
  );
}
