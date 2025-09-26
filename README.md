# Chattify - Real-Time Messaging Application

A full-stack, real-time messaging application built with the MERN stack and Socket.IO. It supports both one-on-one and multi-user group conversations with advanced admin controls and real-time UI updates for all participants.

**[Live Demo](https://chattify-tyuj.onrender.com)**
-----

## Screenshots


-----

## Features

  * **Real-Time Messaging:** Instant message delivery and UI updates using **Socket.IO**.
  * **One-on-One & Group Chats:** Supports both private and multi-user group conversations.
  * **User Authentication:** Secure signup and login with **JWT** and http-only cookies.
  * **Group Management (Admin Controls):**
      * Edit group name and profile picture.
      * Add and remove members from a group.
      * Automatic promotion of a new admin when the current admin leaves.
  * **System Messages:** Automated in-chat notifications for group events (members joining, leaving, being removed, etc.).
  * **Conversation Management:** "Soft delete" for one-on-one chats and a "Leave Group" feature.
  * **Image Uploads:** **Cloudinary** integration for profile pictures, group avatars, and in-chat images.
  * **Theme Customization:** Multiple themes for the user interface.

-----

## Tech Stack

  * **Frontend:** React, Zustand, Socket.IO Client, Tailwind CSS, DaisyUI
  * **Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, Cloudinary

-----

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/manohar-07/Chattify.git
    cd your-repo-name
    ```
2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```
4.  **Create a `.env` file in the `backend` directory** and add the following environment variables:
    ```env
    PORT=5001
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
5.  **Run the backend server:**
    ```bash
    # From the /backend directory
    npm run dev
    ```
6.  **Run the frontend development server:**
    ```bash
    # From the /frontend directory (in a new terminal)
    npm run dev
    ```
