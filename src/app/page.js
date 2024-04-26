import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
      <div className={styles.grid}>
        {Array.from({length: 9}, (_, index) => (
            <div key={index} className={styles.gridItem}>
              <Image
                  src={`/maps/image${index + 1}.jpg`}
                  alt={`Image ${index + 1}`}
                  width={1920}
                  height={1080}
              />
            </div>
        ))}
      </div>
  );
}
