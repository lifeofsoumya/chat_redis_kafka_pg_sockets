import { Kafka, Producer } from "kafkajs"
import fs from "fs";
import path from "path";
import 'dotenv/config'
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers: [`${process.env.KAFKA_HOST}:28276`],
    ssl: {
        ca: [fs.readFileSync(path.resolve('./ca.pem'), "utf-8")]
    },
    sasl: {
        username: 'avnadmin',
        password: `${process.env.KAFKA_PW}`,
        mechanism: "plain"
    }
})

let producer: null | Producer = null;

export async function createProducer(){
    if(producer) return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string){
    const producer = await createProducer();
    producer.send({
        messages: [{key: `message-${Date.now()}`, value: message}],
        topic: "MESSAGES"
    })

    return () => {

    }
}

export async function startMessageConsumer() {
    const consumer = kafka.consumer({groupId: 'default'})
    await consumer.connect();
    await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true}); // ** TOPIC has to be created in kafka dashboard

    await consumer.run({
        autoCommit: true,
        eachMessage: async({message, pause})=>{
            console.log('Inside consumer run -> eachMessage')
            if(!message.value) return;
            try {
                await prismaClient.message.create({
                    data: {
                        text: message.value?.toString()
                    }
                })
            } catch (error) {
                console.log('Something is wrong in inserting in')
                pause();
                setTimeout(()=>{
                    consumer.resume([{ topic: 'MESSAGES'}])
                }, 60 * 1000)
            }
        }
    })
}
export default kafka;