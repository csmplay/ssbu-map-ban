"use client"

import Image from 'next/image';
import styles from '../styles/Home.module.css';
import {useState, useEffect} from 'react';
import io from 'socket.io-client';

export default function Home() {
    const [socket, setSocket] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [pickedMaps, setPickedMaps] = useState([]);
    const [playMap, setPlayMap] = useState([-1, -1]);
    const [lockedMaps, setLockedMaps] = useState([]);
    const [oppLockedMaps, setOppLockedMaps] = useState([]);
    const [shadowMaps, setShadowMaps] = useState([]);
    const [isInteractive, setIsInteractive] = useState(true);
    const [state, setState] = useState(0);
    const [oppState, setOppState] = useState(false);

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
            setOppLockedMaps([]);
            setShadowMaps([]);
            setIsInteractive(true);
            setState(0);
            setPlayMap([-1, -1]);
            setOppState(false);
        });

        newSocket.on('newMap', () => {
            console.log('New Map');
            setSelectedImages([]);
            setPickedMaps([]);
            setShadowMaps([]);
            setIsInteractive(false);
            setPlayMap([-1, -1]);
        })

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
        });

        newSocket.on('shadow', (data) => {
            console.log('Shadow maps:', data);
            setShadowMaps(data);
        });

        newSocket.on('lock', (data) => {
            setLockedMaps(data[0]);
            setOppLockedMaps(data[1]);
        });

        newSocket.on('opp', () => {
            setOppState(true);
        });

        return () => {
            newSocket.close();
        }
    }, []);

    const handleImageClick = (index) => {
        if (state === 0 || state === 4) {
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
            if (!selectedImages.includes(index) && !lockedMaps.includes(index)) {
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
        } else if (state === 3) {
            if (pickedMaps.includes(index)) {
                if (!oppState) {
                    if (!lockedMaps.includes(index)) {
                        setLockedMaps(prev => {
                            socket.emit('lock', [...prev, index]);
                            return [...prev, index];
                        })
                    } else {
                        socket.emit('lock', lockedMaps);
                    }
                } else {
                    if (!oppLockedMaps.includes(index)) {
                        setOppLockedMaps(prev => {
                            socket.emit('lock', [...prev, index]);
                            return [...prev, index];
                        })
                    } else {
                        socket.emit('lock', oppLockedMaps);
                    }
                }

                socket.emit('turn');
                setIsInteractive(true);
                setSelectedImages([]);
                setPickedMaps([]);
                setShadowMaps([]);
                socket.emit('newMap');
            }
        } else if (state === 2) {
            if (!selectedImages.includes(index) && !shadowMaps.includes(index)) {
                if (playMap[0] !== index) {
                    setPickedMaps(prev => {
                        setShadowMaps(previous => {
                            setPlayMap([index, prev.filter(i => i !== index).at(0)])
                            socket.emit('shadow', [...previous, prev.filter(i => i !== index).at(0)]);
                            return [...previous, prev.filter(i => i !== index).at(0)];
                        });
                        socket.emit('pick', [index]);
                        return [index];
                    });
                    setPlayMap(index);
                } else {
                    setPickedMaps(playMap);
                    const newShadowMaps = [];
                    for (let i = 0; i < 9; i++) {
                        if (!selectedImages.includes(i) && !playMap.includes(i)) {
                            newShadowMaps.push(i);
                        }
                    }
                    socket.emit('pick', playMap);
                    setShadowMaps(newShadowMaps);
                    socket.emit('shadow', newShadowMaps);
                    setPlayMap([-1, -1]);
                }
            }
        } else if (state === 5) {
            if (!selectedImages.includes(index) && !shadowMaps.includes(index)) {
                if ((!lockedMaps.includes(index) && !oppState) ||
                    (!oppLockedMaps.includes(index) && oppState)) {
                    if (!pickedMaps.includes(index)) {
                        setPickedMaps([index]);
                        socket.emit('pick', [index]);
                        const newShadowMaps = [];
                        for (let i = 0; i < 9; i++) {
                            if (!selectedImages.includes(i) && i !== index) {
                                newShadowMaps.push(i);
                            }
                        }
                        setShadowMaps(newShadowMaps);
                        socket.emit('shadow', newShadowMaps);
                    } else {
                        setPickedMaps([]);
                        socket.emit('pick', []);
                        setShadowMaps([]);
                        socket.emit('shadow', []);
                    }
                }
            }
        }
    };

    const resetButtonClick = () => {
        setSelectedImages([]);
        setPickedMaps([]);
        setLockedMaps([]);
        setOppLockedMaps([]);
        setShadowMaps([]);
        setIsInteractive(true);
        setState(0);
        setOppState(false);
        socket.emit('reset');
        setPlayMap([-1, -1]);
    }

    const confirmTurnClick = () => {
        if (state === 1) {
            const newShadowMaps = [];
            for (let i = 0; i < 9; i++) {
                if (!selectedImages.includes(i) && !pickedMaps.includes(i)) {
                    newShadowMaps.push(i);
                }
            }
            setShadowMaps(newShadowMaps);
            socket.emit('shadow', newShadowMaps);
            socket.emit('turn');
            setIsInteractive(false);
        } else if (state === 5) {
            socket.emit('loop');
            socket.emit('turn');
        } else if (state === 2) {
            socket.emit('turn');
        }
        else {
            socket.emit('turn');
            setIsInteractive(false);
        }
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

                                <div className={`${styles.overlay}
                                   ${selectedImages.includes(index) ? styles.crossAnimation : ''}`}>
                                        <Image src={'/icons/ban.png'} alt={'banned'}
                                               width={720}
                                               height={480}
                                               draggable={"false"}
                                        />
                                </div>

                                <div className={`${styles.overlay} 
                                    ${styles.noBlend} 
                                    ${lockedMaps.includes(index) ? styles.crossAnimation : ''}
                                    ${shadowMaps.includes(index) ? styles.blurred : ''}`}>
                                        <Image src={'/icons/lock-new.png'} alt={'locked'}
                                               width={720}
                                               height={480}
                                               draggable={"false"}
                                        />
                                </div>

                                <div className={`${styles.overlay} 
                                    ${oppLockedMaps.includes(index) ? styles.crossAnimation : ''}
                                    ${styles.noBlend} 
                                    ${shadowMaps.includes(index) ? styles.blurred : ''}`}>
                                        <Image src={'/icons/lock-opp.png'} alt={'locked-opp'}
                                               width={720}
                                               height={480}
                                               draggable={"false"}
                                        />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button className={state === 0 || state === 4 ? styles.gridButton : styles.pickButton}
                    disabled={state === 0 || state === 4 ? (selectedImages.length !== 3 || !isInteractive) :
                        state === 1 ? (pickedMaps.length !== 2 || !isInteractive) :
                            state === 3 ? true :
                                (pickedMaps.length !== 1 || !isInteractive)}
                    onClick={() => confirmTurnClick()}>
                {state === 0 || state === 4 ? 'Ban' : state === 1 ? 'Pick' : 'Play'}
            </button>
        </div>
    );
}
