"use client"

import Image from 'next/image';
import styles from '../styles/Home.module.css';
import {useState, useEffect} from 'react';
import io from 'socket.io-client';

export default function Home() {
    const [socket, setSocket] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
        });

        newSocket.on('heartbeat', (data) => {
            console.log('Heartbeat from server:', data);
            newSocket.emit('heartbeat', { beat: 1 }); // Respond back to the server heartbeat
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            newSocket.close();
        }
    }, []);

    const handleImageClick = (index) => {
        setSelectedImages(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else if (prev.length < 3) {
                return [...prev, index];
            } else {
                return [...prev.slice(1), index];
            }
        });
    };

    return (
        <div className={styles.pageContainer}>
            <button className={styles.gridButton}>Reset</button>
            <div className={styles.gridContainer}>
                <div className={styles.grid}>
                    {Array.from({length: 9}, (_, index) => (
                        <div key={index} className={styles.gridItem} onClick={() => handleImageClick(index)}>
                            <div className={styles.imageContainer}>
                                <Image
                                    src={`/maps/image${index + 1}.jpg`}
                                    alt={`Image ${index + 1}`}
                                    width={720}
                                    height={480}
                                    draggable={"false"}
                                    className={selectedImages.includes(index) ? styles.blurred : ''}
                                />
                                {selectedImages.includes(index) && (
                                    <div className={`${styles.overlay}`}>
                                        <Image src={'/icons/ban.png'} alt={'banned'}
                                               width={720}
                                               height={480}
                                               draggable={"false"}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button className={styles.gridButton} disabled={selectedImages.length !== 3}>Confirm</button>
        </div>
    );
}
