const { Server } = require('socket.io');

const io = new Server(8000, {
    cors: true
});

const emailToSocketMap = new Map();
const socketidToEmailMap = new Map();

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    socket.on('joinRoom', (data) => {
        const { email, roomID } = data;
        console.log(`User with email: ${email} joining room: ${roomID}`);
        emailToSocketMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(roomID).emit('userJoined', {
            email,
            socketId: socket.id
        });
        socket.join(roomID);
        socket.emit("joinRoom", data);
    });

    socket.on('userCall', ({ to, offer }) => {
        console.log("Call from:", to, offer);

        io.to(to).emit('incomingCall', { from: socket.id, offer });
    })

    socket.on('callAccepted', ({ to, answer }) => {
        io.to(to).emit('callAccepted', { from: socket.id, answer });
    });

    socket.on('peernegotiationneeded',({to,offer})=>{
        io.to(to).emit('peernegotiationneeded', { from: socket.id, offer });
     })
    
    socket.on('peernegotiationdone',({to,answer})=>{
        io.to(to).emit('peernegotiationfinal', { from: socket.id, answer });
    })

    
    
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
});

