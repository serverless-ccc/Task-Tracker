import { useState } from "react";

import { Button, Modal } from "antd";
import { Plus } from "lucide-react";

import useUserStore from "../../store/useUserStore";
import QuickAdd from "../modals/QuickAdd";

const Navbar = () => {
  const logout = useUserStore((state) => state.logout);
  const [isModalOpen, setIsModalOpen] = useState<{
    task?: boolean;
    issue?: boolean;
  }>({
    task: false,
    issue: false,
  });

  return (
    <div>
      <div className="container mx-auto px-8 py-4 sticky top-0 z-50 bg-white rounded-full mb-4">
        <div className="flex justify-between items-center">
          <img
            src="https://student.ccc.training/static/media/logo.50a5a058a55d624e67c8.png"
            alt="logo"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex gap-2">
            <Button
              variant="outlined"
              shape="round"
              icon={<Plus size={12} />}
              onClick={() => setIsModalOpen({ ...isModalOpen, task: true })}
            >
              Task
            </Button>
            <Button onClick={logout} shape="round">
              Logout
            </Button>
          </div>
        </div>
      </div>
      <Modal
        open={isModalOpen.task}
        onCancel={() => setIsModalOpen({ ...isModalOpen, task: false })}
        footer={null}
      >
        <QuickAdd setIsModalOpen={setIsModalOpen} />
      </Modal>
    </div>
  );
};

export default Navbar;
