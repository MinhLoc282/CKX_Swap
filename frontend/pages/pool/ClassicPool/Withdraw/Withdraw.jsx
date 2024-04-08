import React from 'react';
import {
  WithdrawIcon,
} from '../Utils';
import styles from './index.module.css';

import WithdrawImg from '../../../../assets/withdraw.png';

function Withdraw() {
  return (
    <div>
      <div className={styles.RightHeader}>
        <WithdrawIcon />
        Withdraw
      </div>
      <div>
        Withdraw to receive pool tokens and earned trading fees.
      </div>
      <div style={{ marginTop: '32px' }}>
        <img src={WithdrawImg} width="60%" alt="" />
      </div>
    </div>
  );
}

export default Withdraw;
