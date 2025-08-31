import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// 1. Accept a new 'exclude' prop, with a default empty array
const UserList = ({ selectedUsers, onUserSelect, exclude = [] }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const getUsers = async () => {
			try {
				const res = await axiosInstance.get("/users");
				setUsers(res.data);
			} catch (error) {
				toast.error(error.response?.data?.message || "An error occurred");
			} finally {
				setLoading(false);
			}
		};
		getUsers();
	}, []);

	// 2. Add a second filter to exclude users who are already in the group
	const filteredUsers = users
		.filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
		.filter((user) => !exclude.includes(user._id));

	return (
		<div className='flex flex-col gap-4'>
			<input
				type='text'
				placeholder='Search users...'
				className='input input-bordered w-full'
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<div className='flex flex-col gap-2 h-64 overflow-y-auto'>
				{loading && <span className='loading loading-spinner mx-auto' />}
				{!loading &&
					filteredUsers.map((user) => (
						<div
							key={user._id}
							className='flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer'
							onClick={() => onUserSelect(user)}
						>
							<input
								type='checkbox'
								className='checkbox'
								checked={selectedUsers.some((u) => u._id === user._id)}
								readOnly
							/>
							<div className='avatar'>
								<div className='w-10 rounded-full'>
									<img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
								</div>
							</div>
							<span>{user.fullName}</span>
						</div>
					))}
			</div>
		</div>
	);
};
export default UserList;