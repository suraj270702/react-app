import Fastify from "fastify";
import fastifySocketIO from 'fastify-socket.io';

// Fastify instance
const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

// Register Socket.IO plugin
fastify.register(fastifySocketIO, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO event handling
fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for an event to identify the user and join them to a room
    socket.on('identify', (userId) => {
      socket.join(userId);  // Join the user to a room named after their user ID
      console.log(`User ${userId} has joined room ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
});

// Dummy POST endpoint that triggers a notification on success
fastify.post('/perform-operation', async (request, reply) => {
  const operationSuccess = true;

  if (operationSuccess) {
    const userId = request.body.userId;
    // Broadcast to the room associated with the user ID
    fastify.io.to(userId).emit('notification', {
      message: 'Operation was successful!',
      timestamp: new Date(),
    });

    return reply.code(200).send({ message: 'Operation completed successfully!' });
  } else {
    return reply.code(500).send({ error: 'Operation failed.' });
  }
});

// Run the server
const start = async () => {
  try {
    await fastify.listen({ port: 8080 });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
