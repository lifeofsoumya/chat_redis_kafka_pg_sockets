import { Server } from "socket.io"
import Redis from 'ioredis'
import 'dotenv/config'

const pub = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '28263'),
    username: 'default',
    password: process.env.REDIS_PW
});
const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '28263'),
    username: 'default',
    password: process.env.REDIS_PW
});

class SocketService {
    private _io: Server;

    constructor() {
        console.log('INit socket server');
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*"
            }
        });
        sub.subscribe('MESSAGES')
    }

    public initListeners() {
        const io = this.io;
        console.log('Initialize socket listeners...')

        io.on('connect', socket => {
            console.log('New socket connected ', socket.id)
            socket.on('event:message', async ({message}: {message: string}) => {
                console.log('New message received ', message);
                // redis here
                await pub.publish('MESSAGES', JSON.stringify({ message }));
            })
        })
        sub.on('message', (channel, message) => {
            if(channel === 'MESSAGES') {
                io.emit('message', message);
            }
        })
    }

    get io(){
        return this._io;
    }
}

export default SocketService;