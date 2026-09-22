let io = null;

export const setSocketIO = socketInstance => {
  io = socketInstance;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export const initializeSocket = socketInstance => {
  setSocketIO(socketInstance);

  socketInstance.on("connection", socket => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on("join", ({ role, userId, universityId }) => {
      if (!role || !userId) return;

      // Personal room
      socket.join(`${role}:${userId}`);

      console.log(`${role}:${userId} joined`);

      // University room
      if (role === "CanteenAdmin" || role === "UniversityAdmin" || role === "Student") {
        if (universityId) {
          socket.join(`university:${universityId}`);
          console.log(`${role}:${userId} joined university:${universityId}`);
        }
      }

      // Canteen room
      if (role === "CanteenAdmin" && universityId) {
        socket.join(`canteen:${universityId}`);
      }

      // University Admin room
      if (role === "UniversityAdmin" && universityId) {
        socket.join(`universityAdmin:${universityId}`);
      }

      // Super Admin room
      if (role === "SuperAdmin") {
        socket.join("superAdmins");
      }
    });

    socket.on("leave", ({ role, userId, universityId }) => {
      socket.leave(`${role}:${userId}`);

      if (universityId) {
        socket.leave(`university:${universityId}`);
        socket.leave(`canteen:${universityId}`);
        socket.leave(`universityAdmin:${universityId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};
