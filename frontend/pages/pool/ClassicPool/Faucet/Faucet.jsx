/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';
import {
  DepositIcon,
} from '../Utils';
import styles from './index.module.css';
import * as token0 from '../../../../../src/declarations/token0';
import * as token1 from '../../../../../src/declarations/token1';
import * as swap from '../../../../../src/declarations/swap';
import { useAuth } from '../../../../hooks/use-auth-client';

import ckBTC from '../../../../assets/ckBTC.png';
import ckETH from '../../../../assets/ckETH.png';

function Deposit() {
  const {
    swapActor, token0Actor, token1Actor, principal,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [tokenBalance0, setTokenBalance0] = useState(0);
  const [decimals0, setDecimals0] = useState(0);
  const [tokenBalance1, setTokenBalance1] = useState(0);
  const [decimals1, setDecimals1] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  const toggleSwitch = () => {
    setIsChecked(!isChecked);
  };

  const handleDeposit = async () => {
    try {
      setLoading(true);

      // Call icrc1_transfer with the minting account principal as the caller
      const result0 = await token0Actor.transfer_from_minting_account(10 * 10 ** 18);

      console.log(result0);

      const result1 = await token1Actor.transfer_from_minting_account(10 * 10 ** 18);

      console.log(result1);

      setLoading(false);

      // Check results
      toast.success('Deposit successfully');
      getBalanceAndDecimals();
    } catch (e) {
      console.log(e);
      toast.error('Deposit error');
      setLoading(false);
    }
  };

  const getBalanceAndDecimals = async () => {
    if (tokenList.length > 0 && principal) {
      try {
        const balance0 = await token0Actor.icrc1_balance_of({
          owner: principal,
          subaccount: [],
        });
        const dec0 = await token0Actor.icrc1_decimals();

        const balance1 = await token1Actor.icrc1_balance_of({
          owner: principal,
          subaccount: [],
        });
        const dec1 = await token1Actor.icrc1_decimals();

        setTokenBalance0(Number(balance0));
        setDecimals0(Number(dec0));
        setTokenBalance1(Number(balance1));
        setDecimals1(Number(dec1));
      } catch (error) {
        console.error('Error fetching balance and decimals:', error);
      }
    }
  };

  useEffect(() => {
    const handleGetSupportedTokenList = async () => {
      const res = await swapActor.getSupportedTokenList();
      setTokenList(res);
    };

    if (swapActor) {
      handleGetSupportedTokenList();
    }
  }, [swapActor]);

  useEffect(() => {
    getBalanceAndDecimals();
  }, [tokenList, token0Actor, token1Actor]);

  return (
    <div>
      <div className={styles.RightHeader}>
        <DepositIcon />
        Faucet
      </div>
      <div>
        {/* Deposit tokens to start earning trading fees and more rewards. */}
      </div>

      <div className={styles.Deposit}>
        <div className={styles.TitleContainer}>
          <h2 className={styles.Title}>FAUCET TOKEN</h2>
        </div>

        <div>
          <div className={styles.LabelContainer}>
            <div className={styles.Label}>
              <div>
                <span className={styles.Icon} style={{ display: 'flex', alignItems: 'center' }}>
                  {tokenList && tokenList.length > 0 && tokenList[0].symbol
                  && (
                  <>
                    <img width={18} height={18} src={tokenList[0].symbol === 'ckBTC' ? ckBTC : ckETH} alt="" style={{ marginRight: '10px' }} />
                    {' '}
                    {tokenList[0].symbol}
                  </>
                  )}
                </span>
              </div>
              <div>
                Balance:
                {' '}
                {tokenBalance0 && decimals0 && <span>{tokenBalance0 / 10 ** decimals0}</span>}
              </div>
            </div>
          </div>

          <div className={styles.InputContainer}>
            <div className={styles.InputGroup}>
              <input
                type="number"
                className={styles.InputFieldDeposit}
                placeholder="0.0"
                value={10}
              />
              {/* <button type="button" className={styles.MaxButton} onClick={setMaxInput0}>
                Max
              </button> */}
            </div>
          </div>
        </div>

        <div>
          <div className={styles.LabelContainer}>
            <div className={styles.Label}>
              <div>
                <span className={styles.Icon} style={{ display: 'flex', alignItems: 'center' }}>
                  {tokenList && tokenList.length > 1 && tokenList[1].symbol && (
                  <>
                    <img width={18} height={18} src={tokenList[1].symbol === 'ckBTC' ? ckBTC : ckETH} alt="" style={{ marginRight: '10px' }} />
                    <span>{tokenList[1].symbol}</span>
                  </>
                  )}
                </span>
              </div>
              <div>
                Balance:
                {' '}
                {tokenBalance1 && decimals1 && <span>{tokenBalance1 / 10 ** decimals1}</span>}
              </div>
            </div>
          </div>

          <div className={styles.InputContainer}>
            <div className={styles.InputGroup}>
              <input
                type="number"
                className={styles.InputFieldDeposit}
                placeholder="0.0"
                value={10}
              />
              {/* <button type="button" className={styles.MaxButton} onClick={setMaxInput1}>
                Max
              </button> */}
            </div>
          </div>
        </div>

        <div className={styles.ToggleText}>
          <label className={styles.ToggleSwitch}>
            <input type="checkbox" checked={isChecked} onChange={toggleSwitch} />
            <span className={styles.Slider} />
          </label>
          Add tokens in balanced proportion
        </div>
      </div>

      {/* Buttons */}
      <button
        type="button"
        onClick={handleDeposit}
        disabled={loading}
        className={styles.TransferButton}
      >
        {loading ? 'Waiting...' : 'Get'}
      </button>
    </div>
  );
}

export default Deposit;
