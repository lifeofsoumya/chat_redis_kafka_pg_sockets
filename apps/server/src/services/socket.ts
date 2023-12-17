import { Server } from 'socket.io'

class SocketService{
    private _io : Server;

    constructor(){
        console.log('Initialized socket server')
        this._io = new Server();
    }

    public initListener() {
        const io = this.io;
        console.log('Init socket service')
        io.on('connect', (socket) => {
            console.log('Socket connected with id ', socket.id)

            socket.on('event:message', async({message} : {message: string}) => {
                console.log('New message received ', message)
            })
        })
    }

    get io(){
        return this._io
    }
}

export default SocketService;