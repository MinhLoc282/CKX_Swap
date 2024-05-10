import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';
import {
  WithdrawIcon,
} from '../Utils';
import styles from './index.module.css';
import * as token0 from '../../../../../src/declarations/token0';
import * as token1 from '../../../../../src/declarations/token1';
import { useAuth } from '../../../../hooks/use-auth-client';

import WithdrawImg from '../../../../assets/withdraw.png';
import ckBTC from '../../../../assets/ckBTC.png';
import ckETH from '../../../../assets/ckETH.png';

function Withdraw() {
  const {
    swapActor, token0Actor, token1Actor, principal,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [tokenBalance0, setTokenBalance0] = useState(0);
  const [tokenBalance1, setTokenBalance1] = useState(0);
  const [decimals0, setDecimals0] = useState(0);
  const [decimals1, setDecimals1] = useState(0);
  const [amountInput, setAmountInput] = useState(0);
  const [amountInput0, setAmountInput0] = useState(0);
  const [amountInput1, setAmountInput1] = useState(0);
  const [tokenPrincipal, setTokenPrincipal] = useState('');
  const [quickInputAmountIn, setQuickInputAmountIn] = useState(0);

  const changeAmountIn = (percentage) => {
    if (tokenBalance0 && tokenBalance1) {
      const newAmountIn0 = (percentage * (Number(tokenBalance0) / 10 ** 18)) / 100;
      const newAmountIn1 = (percentage * (Number(tokenBalance1) / 10 ** 18)) / 100;
      setAmountInput0(newAmountIn0);
      setAmountInput1(newAmountIn1);
      setAmountInput(newAmountIn0 + newAmountIn1);
      setQuickInputAmountIn(percentage);
    }
    if (percentage === quickInputAmountIn) {
      setQuickInputAmountIn(0);
    }
  };

  const handleDeposit = async () => {
    try {
      setLoading(true);

      // Deposit tokens
      await swapActor.withdraw(
        Principal.fromText(token0.canisterId),
        amountInput0 * 10 ** 18,
      );

      await swapActor.withdraw(
        Principal.fromText(token1.canisterId),
        amountInput1 * 10 ** 18,
      );

      getBalancesAndDecimals();
      setQuickInputAmountIn(0);

      setLoading(false);

      // Check results
      toast.success('Withdraw successfully');
    } catch (e) {
      console.log(e);
      toast.error('Withdraw error');
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGetSupportedTokenList = async () => {
      const res = await swapActor.getSupportedTokenList();
      setTokenList(res);
      setTokenPrincipal(res[0].id);
    };

    if (swapActor) {
      handleGetSupportedTokenList();
    }
  }, [swapActor]);

  const getBalancesAndDecimals = async () => {
    if (tokenPrincipal && principal) {
      try {
        const res = await swapActor.getUserBalances(principal);
        const balance0 = res.find((b) => b[0] === token0.canisterId);
        const balance1 = res.find((b) => b[0] === token1.canisterId);
        const dec0 = await token0Actor.icrc1_decimals();
        const dec1 = await token1Actor.icrc1_decimals();

        setTokenBalance0(Number(balance0[1]));
        setTokenBalance1(Number(balance1[1]));
        setDecimals0(Number(dec0));
        setDecimals1(Number(dec1));
      } catch (error) {
        console.error('Error fetching balances and decimals:', error);
      }
    }
  };

  useEffect(() => {
    getBalancesAndDecimals();
  }, [tokenPrincipal, token0Actor, token1Actor]);

  useEffect(() => {
    changeAmountIn(quickInputAmountIn);
  }, [tokenBalance0, tokenBalance1]);

  return (
    <div>
      <div className={styles.RightHeader}>
        <WithdrawIcon />
        Withdraw
      </div>
      <div>
        Withdraw to receive pool tokens and earned trading fees.
      </div>
      {/* <div style={{ marginTop: '32px' }}>
        <img src={WithdrawImg} width="60%" alt="" />
      </div> */}
      <div className={styles.Deposit}>
        <div className={styles.TitleContainer}>
          <h2 className={styles.Title}>{amountInput.toFixed(6)}</h2>
        </div>

        <div>
          <div className={styles.LabelContainer}>
            <div className={styles.Label}>
              <div>$</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <InfoIcon />
                Available:
                {' '}
                {(tokenBalance0 || tokenBalance1) && (decimals0 || decimals1)
                && (
                  <span>
                    {((tokenBalance0 / 10 ** decimals0)
                    + (tokenBalance1 / 10 ** decimals1)).toFixed(6)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            className={styles.InputFieldDeposit}
            onChange={(e) => {
              const percentage = e.target.value;
              changeAmountIn(percentage);
            }}
            value={quickInputAmountIn}
          />

          <div className={styles.quickInputButton}>
            <button onClick={() => changeAmountIn(20)} style={{ backgroundColor: quickInputAmountIn === 20 ? 'rgba(126, 135, 255, 1)' : 'rgba(24, 25, 33, 1)' }} type="button">20%</button>
            <button onClick={() => changeAmountIn(50)} style={{ backgroundColor: quickInputAmountIn === 50 ? 'rgba(126, 135, 255, 1)' : 'rgba(24, 25, 33, 1)' }} type="button">50%</button>
            <button onClick={() => changeAmountIn(75)} style={{ backgroundColor: quickInputAmountIn === 75 ? 'rgba(126, 135, 255, 1)' : 'rgba(24, 25, 33, 1)' }} type="button">75%</button>
            <button onClick={() => changeAmountIn(100)} style={{ backgroundColor: quickInputAmountIn === 100 ? 'rgba(126, 135, 255, 1)' : 'rgba(24, 25, 33, 1)' }} type="button">100%</button>
          </div>
        </div>
      </div>

      <div className={styles.Deposit}>
        <div className={styles.TitleContainer}>
          <h2 className={styles.SubTitle2}>You will receive both tokens in the balanced amounts</h2>
        </div>

        <div>
          <div className={styles.LabelContainer}>
            <div className={styles.SubTitle2} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>Expected to receive</div>
              <InfoIcon />
            </div>
          </div>

          <div className={styles.InputContainer}>
            {tokenList.map((tokenInfo) => (
              <div className={styles.InputGroup} key={tokenInfo.symbol}>
                <div className={styles.Icon}>
                  <img width={18} height={18} src={tokenInfo.symbol === 'ckBTC' ? ckBTC : ckETH} alt="" />
                  {tokenInfo.symbol}
                </div>

                <div>
                  {tokenInfo.symbol === 'ckBTC' ? amountInput0 : amountInput1}
                </div>
              </div>
            ))}
          </div>

          <h2 className={styles.SubTitle2}>
            This pool is currently used as collateral,
            please head to borrow to redeem the collateral before withdrawal
          </h2>
        </div>
      </div>

      {/* Buttons */}
      <button
        type="button"
        onClick={handleDeposit}
        disabled={loading}
        className={styles.TransferButton}
      >
        {loading ? 'Waiting...' : 'Withdraw'}
      </button>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle opacity="0.4" cx="7.99992" cy="7.99998" r="6.66667" fill="#9FA6FB" />
      <path d="M8.66659 4.66667C8.66659 5.03486 8.36811 5.33333 7.99992 5.33333C7.63173 5.33333 7.33325 5.03486 7.33325 4.66667C7.33325 4.29848 7.63173 4 7.99992 4C8.36811 4 8.66659 4.29848 8.66659 4.66667Z" fill="#9FA6FB" />
      <path fillRule="evenodd" clipRule="evenodd" d="M6.83325 6.66663C6.83325 6.39048 7.05711 6.16663 7.33325 6.16663H7.99992C8.27606 6.16663 8.49992 6.39048 8.49992 6.66663V11.3333C8.49992 11.6094 8.27606 11.8333 7.99992 11.8333C7.72378 11.8333 7.49992 11.6094 7.49992 11.3333V7.16663H7.33325C7.05711 7.16663 6.83325 6.94277 6.83325 6.66663Z" fill="#9FA6FB" />
    </svg>
  );
}

export default Withdraw;
