"use client"

import Image from 'next/image';
import styles from '../styles/Home.module.css';
import {useState} from 'react';

export default function Home() {

    const [selectedImages, setSelectedImages] = useState([]);

    const handleImageClick = (index) => {
        setSelectedImages(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    return (
        <div className={styles.pageContainer}>
            <button className={styles.gridButton}>Button Above</button>

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
                                <div className={`${styles.overlay} ${styles.vision}`}>
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

            <button className={styles.gridButton}>Button Below</button>
        </div>
    );
}
