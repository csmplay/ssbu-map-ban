"use client"

import Image from 'next/image';
import styles from '../styles/Home.module.css';
import {useState, useEffect} from 'react';
import io from 'socket.io-client';

export default function Home() {
    const [socket, setSocket] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [pickedMaps, setPickedMaps] = useState([]);
    const [lockedMaps, setLockedMaps] = useState([]);
    const [shadowMaps, setShadowMaps] = useState([]);
    const [isInteractive, setIsInteractive] = useState(true);
    const [state, setState] = useState(0);
    const [canPickLocked, setCanPickLocked] = useState(true);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
        });

        newSocket.on('heartbeat', () => {
            newSocket.emit('heartbeat');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        newSocket.on('image-ban', (data) => {
            console.log('Image Ban from server:', data);
            setSelectedImages(data);
        });

        newSocket.on('pick', (data) => {
            console.log('Image Pick from server:', data);
            setPickedMaps(data);
        });

        newSocket.on('reset', () => {
            console.log('Performed reset');
            setSelectedImages([]);
            setPickedMaps([]);
            setLockedMaps([]);
            setShadowMaps([]);
            setIsInteractive(true);
            setCanPickLocked(true);
            setState(0);
        });

        newSocket.on('game', () => {
            console.log('Game started');
            setIsInteractive(false);
        });
        
        newSocket.on('turn', (data) => {
            console.log('Accepted a turn');
            setIsInteractive(true);
            setState(data);
        });
        
        newSocket.on('stateUpdate', (data) => {
            console.log('Received state update');
            setState(data);
        })

        newSocket.on('win', () => {
            console.log("Win, can't pick locked");
            setCanPickLocked(false);
        })

        newSocket.on('shadowMaps', (data) => {
            console.log('Shadow maps:', data);
            setShadowMaps(data);
        })

        return () => {
            newSocket.close();
        }
    }, []);

    const handleImageClick = (index) => {
        console.log(state);
        if (state === 0 || state === 3) {
            setSelectedImages(prev => {
                if (prev.includes(index)) {
                    socket.emit('image-ban', prev.filter(i => i !== index));
                    return prev.filter(i => i !== index);
                } else if (prev.length < 3) {
                    socket.emit('image-ban', [...prev, index]);
                    return [...prev, index];
                } else {
                    socket.emit('image-ban', [...prev.slice(1), index]);
                    return [...prev.slice(1), index];
                }
            });
        } else if (state === 1) {
            if (!selectedImages.includes(index)) {
                setPickedMaps(prev => {
                    if (prev.includes(index)) {
                        socket.emit('pick', prev.filter(i => i !== index));
                        return prev.filter(i => i !== index);
                    } else if (prev.length < 2) {
                        socket.emit('pick', [...prev, index]);
                        return [...prev, index];
                    } else {
                        socket.emit('pick', [...prev.slice(1), index]);
                        return [...prev.slice(1), index];
                    }
                })
            }
        } else {
            if (!selectedImages.includes(index)) {

            }
        }
    };

    const resetButtonClick = () => {
        setSelectedImages([]);
        setPickedMaps([]);
        setLockedMaps([]);
        setShadowMaps([]);
        setIsInteractive(true);
        setCanPickLocked(true);
        setState(0);
        socket.emit('reset');
    }

    const confirmTurnClick = () => {
        socket.emit('turn');
        setIsInteractive(false);
    }

    return (
        <div className={styles.pageContainer}>
            <button className={styles.gridButton} onClick={resetButtonClick}>Reset</button>
            <div className={styles.gridContainer}>
                <div className={styles.grid}>
                    {Array.from({length: 9}, (_, index) => (
                        <div key={index} className={`${styles.gridItem}`} onClick={isInteractive ? () => handleImageClick(index) : undefined}>
                            <div className={styles.imageContainer}>
                                <Image
                                    src={`/maps/image${index + 1}.jpg`}
                                    alt={`Image ${index + 1}`}
                                    width={720}
                                    height={480}
                                    draggable={"false"}
                                    className={`
                                    ${selectedImages.includes(index) ? styles.blurred : ''} 
                                    ${pickedMaps.includes(index) ? styles.picked : ''} 
                                    ${shadowMaps.includes(index) ? styles.blurred : ''}`}
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

                                {lockedMaps.includes(index) && (
                                    <div className={`${styles.overlay}`}>
                                        <Image src={'/icons/lock.png'} alt={'banned'}
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
            <button className={state === 0 ? styles.gridButton : styles.pickButton}
                    disabled={state === 0 ? (selectedImages.length !== 3 || !isInteractive) :
                        (pickedMaps.length !== 2 || !isInteractive)}
                    onClick={() => confirmTurnClick()}>
                {state === 0 ? 'Ban' : 'Pick'}
            </button>
        </div>
    );
}
