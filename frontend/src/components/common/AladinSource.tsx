import aladinLogo from '@/assets/images/aladin_logo.png';

import * as styles from './AladinSource.css';

export const AladinSource = () => {
  return (
    <div className={styles.container}>
      <img src={aladinLogo} alt="Aladin logo" className={styles.logo} />
      <span className={styles.text}>Powered by Aladin</span>
    </div>
  );
};
