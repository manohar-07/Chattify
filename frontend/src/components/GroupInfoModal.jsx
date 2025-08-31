import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Camera, Check, Edit, X } from "lucide-react";

const GroupInfoModal = ({ conversation, onClose }) => {
  const { authUser } = useAuthStore();
  const { updateGroup } = useChatStore();

  // State for managing UI
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(conversation.groupName);
  const [isUpdating, setIsUpdating] = useState(false);

  const allParticipants = conversation.participants;
  const isAdmin = authUser._id === conversation.groupAdmin;

  // Preprocess members list
  const sortedParticipants = (() => {
    const admin = allParticipants.find(
      (m) => m._id === conversation.groupAdmin
    );
    const self = allParticipants.find(
      (m) => m._id === authUser._id && m._id !== conversation.groupAdmin
    );
    const others = allParticipants.filter(
      (m) => m._id !== conversation.groupAdmin && m._id !== authUser._id
    );

    // Sort remaining members alphabetically by fullName
    others.sort((a, b) => a.fullName.localeCompare(b.fullName));

    // Build final order
    return [...(admin ? [admin] : []), ...(self ? [self] : []), ...others];
  })();

  // Handler for image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setIsUpdating(true);
      const base64Image = reader.result;
      await updateGroup(conversation._id, { groupPic: base64Image });
      setIsUpdating(false);
    };
  };

  // Handler for name update
  const handleNameUpdate = async () => {
    if (editedName.trim() === conversation.groupName) {
      return setIsEditingName(false);
    }
    setIsUpdating(true);
    await updateGroup(conversation._id, { groupName: editedName.trim() });
    setIsUpdating(false);
    setIsEditingName(false);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <div className="flex flex-col items-center gap-4">
          {/* Group Picture with Upload Button for Admin */}
          <div className="relative avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={conversation.groupPic || "/group_avatar.png"}
                alt="Group Avatar"
              />
            </div>
            {isAdmin && (
              <label
                htmlFor="group-pic-upload"
                className={`absolute bottom-0 -right-2 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdating ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="group-pic-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdating}
                />
              </label>
            )}
          </div>

          {/* Group Name with Edit Button for Admin */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                type="text"
                className="input input-sm input-bordered"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            ) : (
              <h3 className="font-bold text-2xl">{conversation.groupName}</h3>
            )}

            {isAdmin &&
              (isEditingName ? (
                <button
                  className="btn btn-xs btn-circle"
                  onClick={handleNameUpdate}
                  disabled={isUpdating}
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  className="btn btn-xs btn-circle"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit size={16} />
                </button>
              ))}
          </div>
          <p className="text-sm text-base-content/70">
            {allParticipants.length} Members
          </p>
        </div>

        <div className="divider">Members</div>

        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {sortedParticipants.map((member) => (
            <li
              key={member._id}
              className="flex items-center justify-between p-1 rounded-md"
            >
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src={member.profilePic || "/avatar.png"}
                      alt="Member Avatar"
                    />
                  </div>
                </div>
                <span>
                  {member._id === authUser._id ? "You" : member.fullName}
                </span>
              </div>

              {member._id === conversation.groupAdmin && (
                <span className="text-primary text-xs font-semibold">
                  Admin
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupInfoModal;
